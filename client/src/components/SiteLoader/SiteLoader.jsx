import React from "react";
import loaderVideo from "../../assets/loader.webm";

const SiteLoader = () => {
  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center bg-[#f5f6f8]">
      {/* The video carries the whole animation, so there is no ring or glow
          around it. */}
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
    </div>
  );
};

export default SiteLoader;
