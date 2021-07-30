import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const inspect = require('util').inspect;
// admin.initializeApp(functions.config().firebase);
admin.initializeApp();

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const posts = functions.https.onRequest((request, response) => {
  // response.set('Access-Control-Allow-Origin', '*');
  cors(request, response, () => {
    db.collection('posts')
      .orderBy('date', 'desc')
      .get()
      .then(docs => {
        const myPosts: any[] = [];
        docs.docs.forEach(doc => {
          const post = {
            ...doc.data(),
            id: doc.id,
          };
          functions.logger.info(post);
          myPosts.push(post);
        });
        functions.logger.info({ myPosts });
        response.send(myPosts);
      })
      .catch(err => response.send(err));
  });
});

export const createPost = functions.https.onRequest((req, res) => {
  var busboy = new Busboy({ headers: req.headers });

  let fields: any = {};

  busboy.on('file', function(
    fieldname: string,
    file: any,
    filename: string,
    encoding: string,
    mimetype: string,
  ) {
    console.log(
      'File [' +
        fieldname +
        ']: filename: ' +
        filename +
        ', encoding: ' +
        encoding +
        ', mimetype: ' +
        mimetype,
    );
    file.on('data', function(data: any) {
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });
    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
    });
  });
  busboy.on('field', function(
    fieldname: string,
    val: any,
    fieldnameTruncated: any,
    valTruncated: any,
    encoding: string,
    mimetype: string,
  ) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    fields[fieldname] = val
  });
  busboy.on('finish', function() {
    
    db.collection('posts').doc(fields.id).set({
      id: fields.id,
      caption: fields.caption,
      location: fields.location,
      date: parseInt(fields.date),
      imageUrl: ''
    })
    res.send('Done parsing form');
  });
  busboy.end(req.rawBody);

  // cors(request, response, () => {
  //   db.collection('posts').add({

  //   })
  // });
});
