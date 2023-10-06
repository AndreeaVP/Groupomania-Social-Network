const db = require('../config/database');
const fs = require('fs');

exports.createPost = (req, res) => {
    const { user_id, textual_post, image_url } = req.body;
  
    db.query(
      'INSERT INTO posts (user_id, textual_post, image_url) VALUES (?, ?, ?)',
      [user_id, textual_post, image_url],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Post created successfully' });
      }
    );
};

exports.getAllPosts = (req, res) => {
  db.query('SELECT * FROM posts', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ posts: results });
  });
};

exports.getPostById = (req, res) => {
    const postId = req.params.postId;
    
    db.query('SELECT * FROM posts WHERE post_id = ?', [postId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const post = results[0];
      res.status(200).json({ post });
    });
  };
    

exports.updatePost = (req, res) => {
    const postId = req.params.postId;
    const { textual_post, image_url } = req.body;
  
    const updateFields = {};
  
    if (textual_post) {
      updateFields.textual_post = textual_post;
    }
    if (image_url) {
      updateFields.image_url = image_url;
    }
  
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
  
    const query = 'UPDATE posts SET ? WHERE post_id = ?';
  
    db.query(query, [updateFields, postId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.status(200).json({ message: 'Post updated successfully' });
    });
};  

exports.deletePost = (req, res) => {
  const postId = req.params.postId;
  db.query('DELETE FROM posts WHERE post_id = ?', [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted successfully' });
  });
};
