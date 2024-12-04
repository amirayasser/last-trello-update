import React, { useContext, useState } from 'react'
import "./changeBoardBg.css";

import bg1 from '../../assets/pexels-anastasia-shuraeva-7278606.jpg';
import bg2 from '../../assets/pexels-fauxels-3184160.jpg';
import bg3 from '../../assets/pexels-goumbik-296115.jpg';
import bg4 from '../../assets/pexels-ivan-samkov-7213439.jpg';
import bg5 from '../../assets/pexels-mateusz-dach-99805-450035.jpg';
import { ImageContext } from '../context/BgImgContext';

const images = [bg1, bg2, bg3, bg4, bg5]

const ChangeBoardBg = ( ) => {

  const { selectedImage, setSelectedImage } = useContext(ImageContext);
  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  return (
    <div className="image-selector">
      {images.map((img, index) => (
        <div key={index} className="image-option">
          <img
            src={img}
            alt="bg image"
            onClick={() => handleImageSelect(img)}
          />
        </div>
      ))}
    </div>
  );
};

export default ChangeBoardBg
