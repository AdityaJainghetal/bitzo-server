const Video = require("../models/Videomodel");
const Channel = require("../models/Channel/ChannelModel");
const mongoose = require("mongoose");
const imagekit = require("../utils/imagekit");
const categoryModel = require("../models/CategoryModel/category.model");
const ChannelModel = require("../models/Channel/ChannelModel");

const createChannel = async (req, res) => {
  try {
    

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


const uploadVideo = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, description, category } = req.body;

    const channel = await ChannelModel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    if (!req.files || !req.files.video) {
      return res.status(400).json({
        success: false,
        message: "Video file required",
      });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail
      ? req.files.thumbnail[0]
      : null;

    const videoPath = videoFile.path.replace(/\\/g, "/");
    const thumbnailPath = thumbnailFile
      ? thumbnailFile.path.replace(/\\/g, "/")
      : null;

    const newVideo = new Video({
      channel: channelId, // ✅ channel id save
      category,
      title: name?.trim() || "Untitled",
      description,
      videoUrl: videoPath,
      thumbnail: thumbnailPath,
      uploadedBy: req.user?.userId,
    });

    await newVideo.save();

    // ✅ Also push video into channel
    channel.Videosuser.push(newVideo._id);
    await channel.save();

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      video: newVideo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// const getChannels = async (req, res) => {
//   try {
//     const channels = await Channel.find({}).populate("category", "_id name",).populate("Videosuser"); // 👈 id + name

//     res.status(200).json({
//       success: true,
//       channels,
//     });
//   } catch (error) {
//     console.error("Error in getChannels:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };



const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({ user: req.user.id })
      .populate("category", "_id name")
      .populate("owner"); 

    return res.status(200).json({
      success: true,
      count: channels.length,
      channels,
    });

  } catch (error) {
    console.error("Error in getChannels:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// const getChannelById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("📍 getChannelById called with id:", id);

//     let channel = null;

//     // Try to find by ObjectId first, then by email
//     if (mongoose.Types.ObjectId.isValid(id)) {
//       console.log("✅ ID is valid ObjectId, searching by ID...");
//       channel = await Channel.findById(id);
//     } else {
//       console.log(
//         "📧 ID is email, searching by email (case-insensitive):",
//         id.toLowerCase(),
//       );
//       channel = await Channel.findOne({ contactemail: id.toLowerCase() });
//       if (!channel) {
//         console.log(
//           "❌ Channel not found by email. Searching in DB for all emails:",
//         );
//         const allChannels = await Channel.find({}, "contactemail");
//         console.log(
//           "Available emails in DB:",
//           allChannels.map((c) => c.contactemail),
//         );
//       }
//     }

//     if (!channel) {
//       console.log("❌ Channel not found");
//       return res
//         .status(404)
//         .json({ success: false, message: "Channel not found" });
//     }
//     console.log("✅ Channel found:", channel._id);
//     res.status(200).json({ success: true, channel });
//   } catch (error) {
//     console.error("❌ Error in getChannelById:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// const getvideosByChannel = async (req, res) => {
//   try {
//     const { channelId } = req.params;
//     // ✅ Populate creator field to get user details (userId ke saath user ka pura data)
//     const videos = await Video.find({ channel: channelId }).populate(
//       "creator",
//       "_id name email",
//     );
//     res.status(200).json({ success: true, videos });
//   } catch (error) {
//     console.error("Error in getvideosByChannel:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


// GET /api/channels/:id
const getChannelById = async (req, res) => {
  try {
    const channelId = req.params.id;

    // channel ID valid mongoose ObjectId hai ya nahi → simple check
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid channel ID format",
      });
    }

    const channel = await Channel.findById(channelId)
      .populate("category", "_id name")           // category ka name + _id
      .populate("Videosuser");                     // videos ka data

    // Extra safety: check karo ki yeh channel usi user ka hai jo request kar raha hai
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    if (channel.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this channel",
      });
    }

    return res.status(200).json({
      success: true,
      channel,   // ← sirf ek channel return ho raha hai
    });

  } catch (error) {
    console.error("Error in getChannelById:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getvideosByChannel = async (req, res) => {
  try {
    console.log("───────────────────────────────");
    console.log("URL hit:", req.originalUrl);
    console.log("req.params:", req.params);
    console.log("───────────────────────────────");

    // ✅ FIXED
    const channelId = req.params.id;

    // Channel ID check
    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "Channel ID is required in URL",
      });
    }

    // Mongo ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Channel ID format",
      });
    }

    // Find videos by channel
    const videos = await Video.find({ channel: channelId })
      .populate("uploadedBy", "_id name email")
      .populate({
        path: "channel",
        select: "name channelImage channelBanner channeldescription category",
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Videos found: ${videos.length}`);

    return res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });

  } catch (error) {
    console.error("Error in getvideosByChannel:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching videos",
    });
  }
};

// const getvideosByChannel = async (req, res) => {
//   try {
//     const { channelId } = req.params;

//     if (!channelId) {
//       return res.status(400).json({
//         success: false,
//         message: "Channel ID is required in the URL",
//       });
//     }

//     // Optional: validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(channelId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid channel ID format",
//       });
//     }

//     const videos = await Video.find({ channel: channelId })
//       .populate("uploadedBy", "_id name email")
//       .populate({
//         path: "channel",
//         select: "name channelImage channelBanner channeldescription category"
//       })
//       .sort({ createdAt: -1 })
//       .lean();

//     console.log("Videos for channel", channelId, ":", videos.length);

//     res.status(200).json({
//       success: true,
//       count: videos.length,
//       videos,
//     });
//   } catch (error) {
//     console.error("Error in getvideosByChannel:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

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
    const videos = await Video.find().populate("channel", "name channelImage")
  .populate("uploadedBy", "name email");;
    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("Error in getAllVideos:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const recommendedVideos = async (req, res) => {
  try {
    const userCategory = req.user?.category; // user ki category

    let videos = [];

    if (userCategory) {
      const categoryVideos = await Video.find({ category: userCategory })
        .sort({ createdAt: -1 }) // recent first
        .limit(10);

      videos = categoryVideos;
    }

    // 2️⃣ Agar 10 se kam mile toh baaki recent videos add karo
    if (videos.length < 10) {
      const remaining = 10 - videos.length;

      const otherVideos = await Video.find({
        category: { $ne: userCategory },
      })
        .sort({ createdAt: -1 })
        .limit(remaining);

      videos = [...videos, ...otherVideos];
    }

    res.status(200).json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("Error in recommendedVideos:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const trendingVideos = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ views: -1, createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("Error in trendingVideos:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
  getChannels,
  getChannelById,
  getvideosByChannel,
  deleteChannel,
  uploadVideo,
  recommendedVideos,
  trendingVideos,
};
