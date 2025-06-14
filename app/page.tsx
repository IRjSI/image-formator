"use client"

import { CldImage } from 'next-cloudinary';
import React, { useEffect, useRef, useState } from 'react'

const socialFormats = {
  "instagram square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "instagram portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "tweeter post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "tweeter header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "facebook cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
}

type SocialFormat = keyof typeof socialFormats;

export default function SocialPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>("instagram square (1:1)");
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
    }
  }, [selectedFormat, uploadedImage])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData
      })
      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json();
      setUploadedImage(data.publicId);
      
      
    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
      console.log(uploadedImage);
    }
  }

  const handleDownload = async () => {
    if (!imageRef.current) {      
      return
    }    

    // to download image ***
    fetch(imageRef.current.src)
      .then(response => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "image_transformed.jpg"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      })
  }

  return (
    <div className='w-full flex flex-col items-center min-h-screen bg-base-300 p-8'>

      <span className="mb-2 mt-8 text-xl font-semibold">Social Media Image format converter</span>

      <div className="bg-base-100 max-w-xl shadow-sm rounded-xl">
        <div className="p-4 flex flex-col gap-4 items-center justify-center">
          <label className="form-control w-full">
            <span className=''>Select Image</span>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
          {isUploading && <span className="loading loading-spinner loading-md mx-auto" />}
          {uploadedImage ? (
            <div className="flex flex-col gap-4 items-center">
              <select
                className="select select-bordered w-full"
                value={selectedFormat}
                onChange={e => setSelectedFormat(e.target.value as SocialFormat)}
                disabled={isTransforming}
              >
                {Object.keys(socialFormats).map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
              <CldImage
                width={socialFormats[selectedFormat].width}
                height={socialFormats[selectedFormat].height}
                src={uploadedImage}
                sizes="100vw"
                alt="transformed image"
                crop="fill"
                aspectRatio={socialFormats[selectedFormat].aspectRatio}
                gravity='auto'
                ref={imageRef}
                onLoad={() => setIsTransforming(false)}
              />
              <button
                className="btn btn-primary w-full"
                onClick={handleDownload}
                disabled={isTransforming}
              >
                Download
              </button>
              {isTransforming && <span className="text-gray-400 font-light">transforming...</span>}
            </div>
          ) : (
            <div>
              <p className='text-gray-400'>Select an image for format options</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}