import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/posts', (req: Request, res: Response) => {
  const posts = [
    {
      caption: 'Golden Gate Bridge',
      location: 'San Francisco',
    },
    {
      caption: 'London Eye',
      location: 'London',
    },
  ];
  res.send(posts);
});

app.listen(PORT, () => console.log('Express server running'));
