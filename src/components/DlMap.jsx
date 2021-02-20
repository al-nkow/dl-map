import React, { useState, useEffect } from 'react';
import { YMaps, Map, GeolocationControl, ZoomControl, Placemark } from 'react-yandex-maps';
import styled from 'styled-components';
import Search from './Search';
import Terminals from './Terminals';
import Entrance from './Entrance';
// import Zones from './Zones';
import CDIInput from './CDIInput';

const MapWrap = styled.div`
  overflow: hidden;
  border-radius: 3px;
  box-shadow: 0px 1px 10px rgba(0,0,0,0.3);
  position: relative;
`;







// const InputWrap = styled.div`
//   position: relative;
//   margin-bottom: 40px;
// `;
// const Input = styled.input`
//   padding: 10px;
//   border: 1px solid #D6D6D6;
//   border-radius: 4px;
//   box-shadow: none;
//   margin-bottom: 10px;
// `;



















const API_KEY_YMAPS = process.env.REACT_APP_MAP_API_KEY;

const DlMap = ({ setToast }) => {
  let pointRef = '';

  // нужно для установки адреса cdi в поле яндекса
  const [cdiAddress, setCdiAddress] = useState('');

  // Если потребуется вторая точка для уточнения координат подъезда
  const [entranceCoords, setEntranceCoords] = useState([]);
  const [showArea, setShowArea] = useState(false);

  const [pointCoords, setPointCoords] = useState([]);
  const [pointAddress, setPointAddress] = useState('');

  const [mapRef, setMapRef] = useState(null);
  const [ymaps, setYmaps] = useState(null);
  const [isTerminal, setIsTerminal] = useState(false);

  const fetchAddressByCoords = (coords, full) => {
    // &kind=house&results=1 - определяет адрес как ближайший дом
    const url =
      `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY_YMAPS}&format=json&geocode=${coords}${full ? '' : '&kind=house'}&results=1`
  
    fetch(url)
      .then(r => r.json())
      .then(res => {
        if (res && 
          res.response && 
          res.response.GeoObjectCollection && 
          res.response.GeoObjectCollection.featureMember &&
          res.response.GeoObjectCollection.featureMember[0]) {
          const defaultAddress = 
            res.response.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData.text;
          setPointAddress(defaultAddress);
        } else {
          fetchAddressByCoords(coords, true)
        }
      })
      .catch(e => console.log('ERROR:', e));
  }

  useEffect(() => {
    if (ymaps && mapRef) {
      ymaps.geolocation.get({
        mapStateAutoApply: true
      })
      .then(function(result) {
        if (result) {
          const coords = result.geoObjects.position;
          mapRef.setCenter(coords, 16);
          setPointCoords(coords);

          fetchAddressByCoords([...coords].reverse().join('+'));

        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ymaps, mapRef])

  const mapClick = e => {
    setIsTerminal(false);
    // setToast('Невозможно осуществить доставку в эту точку. Укажите адрес доставки внутри области.');
    // Если нужен клик только по области - код ниже надо закомментировать
    if (!showArea) {
      const coords = e.get('coords');

      setPointCoords(coords);
      fetchAddressByCoords([...coords].reverse().join('+'));
    }
  }

  const movePoint = () => {
    const newCoords = pointRef.geometry.getCoordinates();
    setPointCoords(newCoords);
    fetchAddressByCoords([...newCoords].reverse().join('+'));
    setIsTerminal(false);
  }
















  const selectAddress = (item) => {
    const { address, coords } = item;
    const coordArr = coords.split(' ').reverse();
    const zoom = 17;
    setPointCoords(coordArr);
    setPointAddress(address);
    setEntranceCoords([]);
    mapRef.setCenter(coordArr, zoom);
  }

















  
  useEffect(() => {
    if (pointCoords && mapRef) mapRef.balloon.close();
  }, [pointCoords, mapRef]);

  const selectTerminal = (coords, address) => {
    setPointCoords(coords);
    setPointAddress(address);
    setIsTerminal(true);
  }

  // const SetTestCoords = () => {
  //   const myCoords = [59.840921599999994, 30.493900800000002];
  //   const myZoom = 16;
  //   setPointCoords(myCoords);
  //   mapRef.setCenter(myCoords, myZoom);
  // }

  // useEffect(() => {
  //   if (pointAddress)
  //     console.log('[CDI] >>>>>>', pointAddress, '>>>>>>>>', pointCoords);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pointAddress]);

  return (
    <YMaps query={{ apikey: API_KEY_YMAPS }}>
      <CDIInput
        set={setCdiAddress}
        yandexResponse={pointAddress}
        isTerminal={isTerminal}
        setIsTerminal={setIsTerminal}
        setToast={setToast}
      />




      {/* <Input type="text" /> */}






      <MapWrap>
        <Search cdi={cdiAddress} selectAddress={selectAddress} pointAddress={pointAddress} />
        <Map
          modules={['geolocation', 'geocode', 'coordSystem.geo']}
          onLoad={setYmaps}
          onClick={mapClick}
          width={'100%'}
          height={'500px'}
          defaultState={{ center: [55.75, 37.57], zoom: 12 }}
          options={{ suppressMapOpenBlock: true }}
          instanceRef={setMapRef}
        >
          {
            pointCoords && pointCoords.length ? (
              <Placemark
                modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                onDragend={movePoint}
                geometry={pointCoords}
                options={{ draggable: !showArea }}
                properties={{
                  hintContent: pointAddress,
                  balloonContent: '<div style="width: 200px;">' + pointAddress + '</div>'
                }}
                instanceRef={ref => (pointRef = ref)}
              />
            ) : ''
          }
          <Entrance
            entranceCoords={entranceCoords}
            setEntranceCoords={setEntranceCoords}
            pointCoords={pointCoords}
            showArea={showArea}
            setShowArea={setShowArea}
            ymaps={ymaps}
          />
          {/* <Zones
            showArea={showArea}
            setPointCoords={setPointCoords}
            fetchAddressByCoords={fetchAddressByCoords}
          /> */}
          <Terminals selectTerminal={selectTerminal} pointCoords={pointCoords} />
          <ZoomControl />
          <GeolocationControl />
        </Map>
      </MapWrap>
    </YMaps>
  )
}

export default DlMap;