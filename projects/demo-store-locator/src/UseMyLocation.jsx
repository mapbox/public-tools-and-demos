import React, { useContext }from 'react';
import getUserLocation from './utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationArrow, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from './Context/AppContext'

const UseMyLocation = ({ denyLocation, setDenyLocation, setSearchValue }) => {
    
    const { setActiveLocation, loadingUserLocation, setLoadingUserLocation} = useContext(AppContext);

    function handleClick() {
        setLoadingUserLocation(true);
        getUserLocation(setActiveLocation, setLoadingUserLocation, setDenyLocation);
        // empty search input
        setSearchValue('');
    }

    return ( 
        denyLocation ? (
            <div className="mb-2 text-slate-400 text-sm inline-block bg-transwhite px-2 py-2 rounded-md">                
                <FontAwesomeIcon
                icon={faLocationArrow}
                className='mr-2'
                style={{color: "#006241"}}
                /> Enable location services to search near you.
            </div>
        ) : (
            <div>
                <div 
                className="mb-2 md:mb-4  cursor-pointer bg-slate-100 rounded py-1 px-2 flex-none inline-block text-sm text-slate-500 hover:bg-slate-200 transition"
                onClick={handleClick}>                
                    <FontAwesomeIcon
                    icon={faLocationArrow}
                    className='mr-2'
                    style={{color: "#006241"}}
                    /> Use My Location 
                    
                    {loadingUserLocation &&       
                        <FontAwesomeIcon
                            icon={faSpinner}
                            className="ml-2 animate-spin"
                            style={{color: "#006241"}}
                            />
                    }
                </div>
            </div>
            

        )
    )
}

export default UseMyLocation;