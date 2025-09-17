import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Route de test simple
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.get('/lessons', (req, res) => {
  res.json([
    { id: 1, name: 'Test Lesson 1' },
    { id: 2, name: 'Test Lesson 2' }
  ]);
});

app.listen(port, () => {
  console.log(`🚀 Test server started at http://localhost:${port}`);
}); 