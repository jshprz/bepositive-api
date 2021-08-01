import http from 'http';
import express from 'express';

const router = express.Router();

router.get("/get-users", (req, res) => {
  res.json({'name': 'Joshua'});
});

export default router;