const db = require('../config/database');

// Create a new comment 
exports.createComment = (req, res) => {
    const { postId, comment } = req.body;
    const userId = req.body.userId;
  
    db.query(
      'INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)',
      [postId, userId, comment],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
  
        const commentId = result.insertId;
        const createdComment = {
          commentId: commentId,
          comment: comment,
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString(),
        };

        res.status(201).json(createdComment);
      }
    );
};  

// Update comment
exports.updateComment = (req, res) => {
    const commentId = req.params.commentId;
    const { comment } = req.body;
    const userId = req.body.userId;
    
    db.query(
      'UPDATE comments SET comment = ? WHERE comment_id = ? AND user_id = ?',
      [comment, commentId, userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Comment not found or permission denied' });
        }
  
        res.status(200).json({ message: 'Comment updated successfully' });
      }
    );
};

// Delete comment
exports.deleteComment = (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.body.userId;

  db.query(
    'DELETE FROM comments WHERE comment_id = ? AND user_id = ?',
    [commentId, userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Comment not found or permission denied' });
      }
      
      res.status(200).json({ message: 'Comment deleted successfully' });
    }
  );
};

// Get comment by post Id 
exports.getCommentsByPostId = (req, res) => {
  const postId = req.params.postId;

  db.query(
    'SELECT c.*, u.firstname, u.lastname, u.image_url FROM comments c JOIN users u ON c.user_id = u.user_id WHERE c.post_id = ?',
    [postId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ comments: results });
    }
  );
};