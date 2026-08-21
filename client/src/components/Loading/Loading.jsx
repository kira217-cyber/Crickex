import React from "react";
import loaderVideo from "../../assets/loader.webm";

/**
 * Loading Component
 * Usage:
 *  <Loading open={loading} />
 *  <Loading open text="Processing..." />
 */

const Loading = ({ open = false, text = "" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Loader: the video carries the whole animation, so there is no ring or
          glow around it. */}
      <div className="relative flex flex-col items-center justify-center">
        <video
          src={loaderVideo}
          className="h-50 w-50 object-contain"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          controlsList="nodownload noplaybackrate"
          draggable={false}
        />

        {/* Optional Text */}
        {/*
        {text && (
          <div className="mt-5 text-[13px] font-extrabold text-yellow-200/90">
            {text}
          </div>
        )}
        */}
      </div>
    </div>
  );
};

export default Loading;
