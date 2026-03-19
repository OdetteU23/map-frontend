//For contents' single view
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SingleView = () => {
    const [imageSrc, setImageSrc] = useState('');
    const navigate = useNavigate();
    const handleImageClick = (src: string) => {
        setImageSrc(src);
        navigate('/image-viewer');
    };

    return (
        <div>
            <img src={imageSrc} alt="Selected" 
            onClick={(e) => handleImageClick((e.target as HTMLImageElement).src)} />
        </div>
    );
};

export default SingleView;