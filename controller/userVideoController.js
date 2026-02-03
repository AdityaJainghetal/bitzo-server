const Video = require("../models/Videomodel");
// const User = require("../models/usermodel");

const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({});
    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("Error in getAllVideos:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }
    res.status(200).json({ success: true, video });
  } catch (error) {
    console.error("Error in getVideoById:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const addView = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }
    // Increment view count for public view
    video.views = (video.views || 0) + 1;
    await video.save();
    res.status(200).json({ success: true, message: "View added!", views: video.views });
  } catch (error) {
    console.error("Error in addView:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const likeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.likesCount = (video.likesCount || 0) + 1;
    await video.save();

    res.status(200).json({
      success: true,
      message: "Video liked",
      likes: video.likesCount,
    });
  } catch (error) {
    console.error("Error in likeVideo:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const dislikeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.dislikesCount = (video.dislikesCount || 0) + 1;
    await video.save();

    res.status(200).json({
      success: true,
      message: "Video disliked",
      dislikes: video.dislikesCount,
    });
  } catch (error) {
    console.error("Error in dislikeVideo:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const addComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { commentText } = req.body;

    if (!commentText) {
      return res.status(400).json({
        success: false,
        message: "Comment text required",
      });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.comments.push({
      text: commentText,
      createdAt: new Date(),
    });

    await video.save();

    res.status(200).json({
      success: true,
      message: "Comment added",
    });
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const getComments = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).select("comments");
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      comments: video.comments,
    });
  } catch (error) {
    console.error("Error in getComments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const deleteComment = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const userId = req.user._id;
    const video = await Video.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }
    const commentIndex = video.comments.findIndex(comment => comment._id.toString() === commentId);
    if (commentIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }
    if (video.comments[commentIndex].user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "You are not authorized to delete this comment" });
    }
    video.comments.splice(commentIndex, 1);
    await video.save();
    res.status(200).json({ success: true, message: "Comment deleted!" });
  } catch (error) {
    console.error("Error in deleteComment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// const getVideoInteraction = async (req, res) => {
//   try {
//     const { videoId } = req.params;
//     const userId = req.user._id;
//     const video = await Video.findById(videoId);
//     if (!video) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Video not found" });
//     }
//     const isLiked = video.likes.includes(userId);
//     const isDisliked = video.dislikes.includes(userId);
//     res.status(200).json({
//       success: true,
//       liked: isLiked,
//       disliked: isDisliked,
//       likes: video.likes.length,
//       dislikes: video.dislikes.length
//     });
//   } catch (error) {
//     console.error("Error in getVideoInteraction:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
const getVideoInteraction = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).lean();

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    return res.status(200).json({
      success: true,
      liked: false,        // user identify nahi ho raha
      disliked: false,     // user identify nahi ho raha
      likes: video.likes?.length || 0,
      dislikes: video.dislikes?.length || 0,
    });
  } catch (error) {
    console.error("Error in getVideoInteraction:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getAllVideos,
  getVideoById,
  addView,
  likeVideo,
  dislikeVideo,
  addComment,
  getComments,
  deleteComment,
  getVideoInteraction,
  
};
