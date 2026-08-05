import { asynchandler } from "../utils/asynchandler.js";
import { Apiresolve } from "../utils/Apiresolved.js";
import { apireject } from "../utils/Apireject.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/claudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const genAccessandrefreshtoken = async (userid) => {
  try {
    const user = await User.findById(userid);
    if (!user) {
      throw new apireject(400, "cant find user!!");
    }

    const accesstoken = user.getaccesstoken();
    const refreshtoken = user.getacrefreshtoken();

    user.refreshtoken = refreshtoken;
    await user.save({ validateBeforeSave: false });
    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new apireject(500, "Failed to generate authentication tokens");
  }
};

const registerUser = asynchandler(async (req, res) => {
  const { uname, email, password, fullname } = req.body;

  if (
    [uname, email, password, fullname].some((field) => field?.trim() === "")
  ) {
    throw new apireject(400, "enter all credentials");
  }

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(uname)) {
    throw new apireject(
      400,
      "Username must be 3-30 characters long and contain only alphanumeric characters and underscores",
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new apireject(400, "Invalid email format");
  }

  if (password.length < 8) {
    throw new apireject(400, "Password must be at least 8 characters long");
  }

  let existUser = await User.findOne({
    $or: [{ uname }, { email }],
  });

  if (existUser) {
    throw new apireject(400, "already exist user");
  }

  const avatarLocalpath = req.files?.avatar?.[0]?.path;
  let coverLocalPath = null;
  if (
    req.files &&
    Array.isArray(req.files.cover) &&
    req.files.cover.length > 0
  ) {
    coverLocalPath = req.files.cover[0].path;
  }

  if (!avatarLocalpath) {
    throw new apireject(400, "avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalpath);
  const cover = await uploadOnCloudinary(coverLocalPath);

  if (!avatar) {
    throw new apireject(400, "avatar file is required");
  }

  const user = await User.create({
    uname: uname.toLowerCase(),
    email,
    password,
    fullname,
    avatar: avatar.url,
    cover: cover?.url || "",
  });

  let created = await User.findById(user._id).select("-password -refreshtoken");

  if (!created) {
    throw new apireject(500, "problem in user creation");
  }

  res.status(201).json(new Apiresolve(200, created, "user created"));
});

const loginUser = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new apireject(400, "invalid creditials");
  }

  let user = await User.findOne({
    $or: [{ email }],
  });

  if (!user) {
    throw new apireject(400, "Invalid credentials");
  }

  const ispass = await user.isPasswordCorrect(password);

  if (!ispass) {
    throw new apireject(400, "Invalid credentials");
  }

  const { accesstoken, refreshtoken } = await genAccessandrefreshtoken(
    user._id,
  );

  const loggedin = await User.findById(user._id).select(
    "-password -refreshtoken",
  );

  if (!loggedin) {
    throw new apireject(400, "Login failed, please try again");
  }

  const option = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res
    .status(200)
    .cookie("accesstoken", accesstoken, option)
    .cookie("refreshtoken", refreshtoken, option)
    .json(
      new Apiresolve(
        200,
        { user: loggedin, accesstoken, refreshtoken },
        "logged in successully",
      ),
    );
});

const RefreshAccesstoken = asynchandler(async (req, res) => {
  const incomingRefresh = req.cookies.refreshtoken;

  if (!incomingRefresh) {
    throw new apireject(401, "refresh token required");
  }
  try {
    const decoded = jwt.verify(incomingRefresh, process.env.REFRESH_TOKEN);
    const user = await User.findById(decoded?._id);
    if (!user) {
      throw new apireject(401, "Invalid refresh token");
    }
    if (incomingRefresh !== user?.refreshtoken) {
      throw new apireject(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };
    const { accesstoken, refreshtoken: newrefreshtoken } =
      await genAccessandrefreshtoken(user._id);

    res
      .status(200)
      .cookie("accesstoken", accesstoken, options)
      .cookie("refreshtoken", newrefreshtoken, options)
      .json(
        new Apiresolve(
          200,
          {
            accesstoken,
            refreshtoken: newrefreshtoken,
          },
          "access token refreshtoken genrated successfully",
        ),
      );
  } catch (error) {
    throw new apireject(401, "Invalid or expired refresh token");
  }
});

const logoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshtoken: undefined,
      },
    },
    {
      returnDocument: "after",
    },
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new Apiresolve(200, {}, "logged out successfully"));
});

const updatePassword = asynchandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  if (!oldpassword || !newpassword) {
    throw new apireject(400, "enter both old and new password");
  }
  let user = await User.findById(req.user._id);
  if (!user) {
    throw new apireject(400, "user not found");
  }
  let ispass = await user.isPasswordCorrect(oldpassword);
  if (!ispass) {
    throw new apireject(400, "old password not match");
  }
  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new Apiresolve(200, {}, "password updated successfully"));
});

const getUserProfile = asynchandler(async (req, res) => {
  let user = await User.findById(req.user._id).select(
    "-password -refreshtoken",
  );
  if (!user) {
    throw new apireject(400, "user not found");
  }

  res
    .status(200)
    .json(new Apiresolve(200, user, "user profile fetched successfully"));
});

const updateUserProfile = asynchandler(async (req, res) => {
  const { email, fullname } = req.body;
  if (!email || !fullname) {
    throw new apireject(400, "enter both email and fullname");
  }

  let user = await User.findById(req.user._id);
  if (!user) {
    throw new apireject(400, "user not found");
  }
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        email: email,
        fullname: fullname,
      },
    },
    { returnDocument: "after" },
  ).select("-password -refreshtoken");
  if (!updated) {
    throw new apireject(400, "email and fullname not updated");
  }

  res.status(200).json(new Apiresolve(200, {}, "updated profile"));
});

const updateavatar = asynchandler(async (req, res) => {
  const avatarLocalpath = req.file?.path;

  if (!avatarLocalpath) {
    throw new apireject(400, "avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalpath);

  if (!avatar.url) {
    throw new apireject(400, "Error while uploading on cloudinary");
  }

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url + "?t=" + Date.now(),
      },
    },
    { returnDocument: "after" },
  ).select("-password -refreshtoken");

  return res
    .status(200)
    .json(new Apiresolve(200, updated, "avatar updated successfully"));
});

const updatecover = asynchandler(async (req, res) => {
  const coverpath = req.file?.path;
  if (!coverpath) {
    throw new apireject(400, "upload cover ");
  }
  const cover = await uploadOnCloudinary(coverpath);
  if (!cover) {
    throw new apireject(400, "error while uploading on claudinary");
  }

  let updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        cover: cover.url + "?t=" + Date.now(),
      },
    },
    { returnDocument: "after" },
  ).select("-password -refreshtoken");
  if (!updated) {
    throw new apireject(400, "cover not updated");
  }
  return res
    .status(200)
    .json(new Apiresolve(200, updated, "cover image updated successfully"));
});

const removeAvatar = asynchandler(async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { avatar: 1 } },
    { returnDocument: "after" },
  ).select("-password -refreshtoken");

  return res
    .status(200)
    .json(new Apiresolve(200, updated, "Avatar removed successfully"));
});

const removeCover = asynchandler(async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { cover: 1 } },
    { returnDocument: "after" },
  ).select("-password -refreshtoken");
  if (!updated) {
    throw new apireject(400, "Failed to remove cover");
  }
  res
    .status(200)
    .json(new Apiresolve(200, updated, "Cover removed successfully"));
});

const getuserchannelprofile = asynchandler(async (req, res) => {
  const { uname } = req.params;

  if (!uname?.trim()) {
    throw new apireject(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        uname: uname.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelSubscribedToCount: { $size: "$subscribedTo" },
        issubscribed: {
          $cond: {
            if: req.user?._id
              ? {
                  $in: [
                    new mongoose.Types.ObjectId(req.user._id),
                    "$subscribers.subscriber",
                  ],
                }
              : false,
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        uname: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        issubscribed: 1,
        avatar: 1,
        cover: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new apireject(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new Apiresolve(200, channel[0], "Channel profile fetched successfully"),
    );
});

const getWatchHistory = asynchandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistoryDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    uname: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              ownerDetails: {
                $first: "$ownerDetails",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!user?.length) {
    throw new apireject(404, "user not found");
  }

  res
    .status(200)
    .json(
      new Apiresolve(
        200,
        user[0].watchHistoryDetails,
        "watch history fetched successfully",
      ),
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  RefreshAccesstoken,
  updatePassword,
  getUserProfile,
  updateUserProfile,
  updateavatar,
  updatecover,
  removeAvatar,
  removeCover,
  getuserchannelprofile,
  getWatchHistory,
};
