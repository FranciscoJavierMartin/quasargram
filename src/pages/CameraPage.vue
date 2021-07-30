<template>
  <q-page class="constrain-more q-pa-md">
    <div class="camera-frame q-pa-md">
      <video class="full-width" autoplay ref="video" v-show="!imageCaptured" />
      <transition name="fade">
        <canvas
          ref="canvas"
          class="full-width"
          height="240"
          v-show="imageCaptured"
        />
      </transition>
    </div>
    <div class="text-center q-pa-md">
      <q-btn
        v-if="this.hasCameraSupport"
        round
        color="grey-10"
        icon="eva-camera"
        size="lg"
        @click="this.captureImage"
        :disable="this.imageCaptured"
      />
      <q-file
        outlined
        v-model="this.imageUpload"
        @input="this.captureImageFallback"
        v-else
        label="Choose an image"
        accept="image/*"
      >
        <template v-slot:prepend>
          <q-icon name="eva-attach-outline" />
        </template>
      </q-file>
      <div class="row justify-center q-ma-md">
        <q-input
          v-model="post.caption"
          class="col col-sm-6"
          label="Caption *"
        />
      </div>
      <div class="row justify-center q-ma-md">
        <q-input
          v-model="post.location"
          class="col col-sm-6"
          label="Location"
          dense
          :loading="locationLoading"
        >
          <template v-slot:append>
            <q-btn
              v-if="!locationLoading && locationSupported"
              @click="getLocation"
              round
              dense
              flat
              icon="eva-navigation-2-outline"
            />
          </template>
        </q-input>
      </div>
      <div class="row justify-center q-mt-lg">
        <q-btn
          color="primary"
          label="Post image"
          rounded
          unelevated
          @click="addPost"
          :disable="!post.caption || post.photo"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { uid } from 'quasar';

export default Vue.extend({
  name: 'CameraPage',
  data() {
    return {
      post: {
        id: uid(),
        caption: '',
        location: '',
        photo: null as any,
        date: Date.now(),
      },
      imageCaptured: false,
      hasCameraSupport: true,
      imageUpload: [],
      locationLoading: false,
    };
  },
  computed: {
    locationSupported() {
      return navigator.geolocation;
    },
  },
  methods: {
    initCamera(): void {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false,
        })
        .then(stream => {
          (this.$refs.video as any).srcObject = stream;
        })
        .catch(error => (this.hasCameraSupport = false));
    },
    captureImage(): void {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      canvas.width = video.getBoundingClientRect().width;
      canvas.height = video.getBoundingClientRect().height;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imageCaptured = true;
      this.post.photo = this.dataURI2Blob(canvas.toDataURL());
      this.disableCamera();
    },
    captureImageFallback(file: File): void {
      this.post.photo = file;

      const canvas = this.$refs.canvas;
      const context = canvas.getContext('2d');

      const reader = new FileReader();
      reader.onload = event => {
        const image = new Image();
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0);
          this.imageCaptured = true;
        };
        image.src = event.target.result;
      };

      reader.readAsDataURL(file);
    },
    disableCamera(): void {
      this.$refs.video.srcObject.getVideoTracks().forEach((track: any) => {
        track.stop();
      });
    },
    dataURI2Blob(dataURI: string): Blob {
      const bytesString = atob(dataURI.split(',')[1]);
      const mimeString = dataURI
        .split(',')[0]
        .split(':')[1]
        .split(';')[0];

      const ab = new ArrayBuffer(bytesString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < bytesString.length; i++) {
        ia[i] = bytesString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeString });
      return blob;
    },
    getLocation(): void {
      this.locationLoading = true;
      navigator.geolocation.getCurrentPosition(
        (position: Position) => {
          this.locationLoading = false;
          this.getCityAndCountry(position);
        },
        err => {
          this.locationLoading = false;
          this.locationError();
        },
        { timeout: 10000 },
      );
    },
    getCityAndCountry(position: Position) {
      const apiUrl = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1`;
      this.$axios
        .get(apiUrl)
        .then((result: any) => {
          this.locationSuccess(result);
        })
        .catch(console.log);
    },
    locationSuccess(result: any) {
      this.post.location = result.data.city;
      if (result.data.country) {
        this.post.location += `, ${result.data.country}`;
      }
    },
    locationError() {
      this.$q.dialog({
        title: 'Error',
        message: 'Could not find your location',
      });
    },
    addPost() {
      this.$q.loading.show();
      const formData = new FormData();
      formData.append('id', this.post.id);
      formData.append('caption', this.post.caption);
      formData.append('location', this.post.location);
      formData.append('date', this.post.date);
      formData.append('file', this.post.photo, `${this.post.id}.png`);

      this.$axios
        .post(`${process.env.API}/createPost`, formData)
        .then(response => {
          this.$router.push('/');
          this.$q.notify({
            message: 'Post created',
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
            actions: [{ label: 'Dismiss', color: 'white', handler: () => {} }],
          });
        })
        .catch(() => {
          this.$q.dialog({
            title: 'Error',
            message: 'Sorry, could not create post',
          });
        })
        .finally(() => {
          this.$q.loading.hide();
        });
    },
  },
  mounted() {
    this.initCamera();
  },
  beforeDestroy() {
    if (this.hasCameraSupport) {
      this.disableCamera();
    }
  },
});
</script>

<style lang="scss">
.camera-frame {
  border: 2px solid $grey-10;
  border-radius: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
