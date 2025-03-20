import React from 'react';
import './FaceRecognition.css';
import FacesList from './FacesList';


const FaceRecognition = ({ imageUrl, box }) => {
    return (
        <div className='center ma'>
            <div className='absolute mt2'>
                <img id='inputimage' src={imageUrl} alt='' width='500px' height='auto' />
                <FacesList box={box} />
            </div>
        </div>
    );
}
export default FaceRecognition;