import React, { useContext }from 'react';
import getUserLocation from './utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from './Context/AppContext'

const UseMyLocation = ({ denyLocation, setSearchValue }) => {
    
    const { setActiveLocation } = useContext(AppContext);

    function handleClick() {
        getUserLocation(setActiveLocation, denyLocation);
        // empty search input
        setSearchValue('');
    }

    return ( 
        denyLocation ? (
            <div className="mb-4 ml-2 text-slate-400 text-sm">                
                <FontAwesomeIcon
                icon={faLocationArrow}
                className='mr-2'
                style={{color: "#006241"}}
                /> Enable location services to search near you.
            </div>
        ) : (
            <div>
                <div 
                className="mb-6 cursor-pointer bg-slate-100 rounded py-1 px-2 flex-none inline-block text-sm text-slate-500 hover:bg-slate-200 transition"
                onClick={handleClick}>                
                    <FontAwesomeIcon
                    icon={faLocationArrow}
                    className='mr-2'
                    style={{color: "#006241"}}
                    /> Use My Location
                </div>
            </div>
            

        )
    )
}

export default UseMyLocation;