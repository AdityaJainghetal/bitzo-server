const Video = require("../models/Videomodel");
// const User = require("../models/usermodel");
const Channel = require("../models/Channel/ChannelModel");

const imagekit = require("../utils/imagekit");
const categoryModel = require("../models/CategoryModel/category.model");

const createChannel = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const { name, channeldescription, category, contactemail, videoUrl } =
      req.body;

    const userId = req.user.userId;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Channel name and category are required",
      });
    }

    // 🔹 Check category exists
    const categoryData = await categoryModel.findById(category);
    if (!categoryData) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    let channelImageUrl = "";
    let channelBannerUrl = "";

    if (req.files?.channelImage?.[0]) {
      try {
        const file = req.files.channelImage[0];
        console.log("Uploading channel image:", {
          name: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        });

        // Convert buffer to base64 string
        const base64String = file.buffer.toString("base64");

        const imageRes = await imagekit.upload({
          file: base64String,
          fileName: `channel-img-${Date.now()}-${file.originalname}`,
          folder: "channelImages",
          overwriteFile: true,
        });
        channelImageUrl = imageRes.url;
        console.log("✅ Channel image uploaded:", channelImageUrl);
      } catch (imageError) {
        console.error("❌ ImageKit Error:", imageError);
        console.error("Full error:", JSON.stringify(imageError, null, 2));
        throw imageError;
      }
    }

    if (req.files?.channelBanner?.[0]) {
      try {
        const file = req.files.channelBanner[0];
        console.log("Uploading channel banner:", {
          name: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        });

        // Convert buffer to base64 string
        const base64String = file.buffer.toString("base64");

        const bannerRes = await imagekit.upload({
          file: base64String,
          fileName: `channel-banner-${Date.now()}-${file.originalname}`,
          folder: "channelBanners",
          overwriteFile: true,
        });
        channelBannerUrl = bannerRes.url;
        console.log("✅ Channel banner uploaded:", channelBannerUrl);
      } catch (bannerError) {
        console.error("❌ ImageKit Error:", bannerError);
        console.error("Full error:", JSON.stringify(bannerError, null, 2));
        throw bannerError;
      }
    }

    const newChannel = await Channel.create({
      name: name,

      channeldescription,
      category: categoryData._id,
      contactemail,
      videoUrl: videoUrl || "",
      channelImage: channelImageUrl,
      channelBanner: channelBannerUrl,
      creator: userId,
    });

    // 🔹 Populate category name for response
    const populatedChannel = await Channel.findById(newChannel._id).populate(
      "category",
      "name",
    );

    return res.status(201).json({
      success: true,
      message: "Channel created successfully",
      channel: populatedChannel,
    });
  } catch (error) {
    console.error("Error in createChannel:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

const createChannelByUploadVideo = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, videofile, thumbnail, category, description } = req.body;
    const userId = req.user._id;
    const videoUrl = req.file.path;
    // Verify channel exists and belongs to user
    const channel = await Channel.findOne({ _id: channelId });
    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found or unauthorized" });
    }
    // Create new video
    const newVideo = new Video({
      name,
      videofile: videoUrl,
      thumbnail,
      category,
      description,
      creator: userId,
      channel: channelId,
    });
    await newVideo.save();
    res.status(201).json({
      success: true,
      message: "Video uploaded to channel",
      video: newVideo,
    });
  } catch (error) {
    console.error("Error in createChannelByUploadVideo:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({}).populate("category", "_id name"); // 👈 id + name

    res.status(200).json({
      success: true,
      channels,
    });
  } catch (error) {
    console.error("Error in getChannels:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getChannelById = async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }
    res.status(200).json({ success: true, channel });
  } catch (error) {
    console.error("Error in getChannelById:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getvideosByChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const videos = await Video.find({ channel: channelId });
    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("Error in getvideosByChannel:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;
    const channel = await Channel.find.findOneAndDelete({
      _id: channelId,
      creator: userId,
    });
    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found or unauthorized" });
    }
    await Video.deleteMany({ channel: channelId });
    res.status(200).json({
      success: true,
      message: "Channel and associated videos deleted",
    });
  } catch (error) {
    console.error("Error in deleteChannel:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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
    res
      .status(200)
      .json({ success: true, message: "View added!", views: video.views });
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
    const commentIndex = video.comments.findIndex(
      (comment) => comment._id.toString() === commentId,
    );
    if (commentIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }
    if (video.comments[commentIndex].user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
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
      liked: false, // user identify nahi ho raha
      disliked: false, // user identify nahi ho raha
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
  createChannel,
  createChannelByUploadVideo,
  getChannels,
  getChannelById,
  getvideosByChannel,
  deleteChannel,
};
