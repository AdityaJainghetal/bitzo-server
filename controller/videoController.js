const Video = require("../models/Videomodel");

exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, type, duration } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file is required"
      });
    }

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: "Title and type are required"
      });
    }

    const video = await Video.create({
      title,
      description,
      type,
      duration,
      videoUrl: req.file.path,
      // creator: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ✏️ Update Video
 */
exports.updateVideoupdated = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, duration } = req.body;

    // 1. Find video
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // 2. Update fields if provided
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (type) video.type = type;
    if (duration) video.duration = Number(duration);

    // 3. If new video file uploaded → update URL
    if (req.file) {
      const filePath = req.file.path.replace(/\\/g, "/");
      video.videoUrl = filePath;
    }

    // 4. Save updated video
    await video.save();

    // 5. Generate full URL for frontend
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fullVideoUrl = `${baseUrl}/${video.videoUrl}`;

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      video: {
        ...video.toObject(),
        videoUrl: fullVideoUrl,
      },
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during update",
      error: error.message,
    });
  }
};



exports.uploadVideo = async (req, res) => {
  try {
    // 1. Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file is required",
      });
    }

    // 2. Validate required fields
    const { title, description, type, duration } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: "Title and type are required",
      });
    }

    // 3. Normalize path → always use forward slashes (good for all OS)
    const filePath = req.file.path.replace(/\\/g, '/');

    // 4. Create video document → store RELATIVE PATH only (best practice)
    const video = await Video.create({
      title,
      description: description || '',
      type,
      duration: duration ? Number(duration) : undefined,
      videoUrl: filePath,               // ← store only "uploads/xxx.mp4"
      // creator: req.user?._id,        // uncomment when auth is active
      // views: 0,                      // default in schema?
    });

    // 5. Generate full accessible URL **only for response**
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fullVideoUrl = `${baseUrl}/${filePath}`;

    // 6. Send response with full URL (frontend needs this)
    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      video: {
        ...video.toObject(),           // convert mongoose doc to plain object
        videoUrl: fullVideoUrl,        // ← override with full URL for frontend
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during upload",
      error: error.message,
    });
  }
};
/**
 * 📥 Get All Videos
 */
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      videos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 📄 Get Single Video by ID
 */
exports.getSingleVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    res.status(200).json({
      success: true,
      video
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 🗑️ Delete Video
 */
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    await video.deleteOne();

    res.status(200).json({
      success: true,
      message: "Video deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



