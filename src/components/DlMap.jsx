/*
Использовать геокодер можно бесплатно, если в сутки к нему, а также к маршрутизатору и панорамам вы делаете суммарно не больше 25 тысяч запросов
*/

import React, { useState, useEffect } from 'react';
import { YMaps, Map, GeolocationControl, Placemark, Circle } from 'react-yandex-maps';
import styled from 'styled-components';
import Search from './Search';

const MapWrap = styled.div`
  overflow: hidden;
  border-radius: 3px;
  box-shadow: 0px 1px 10px rgba(0,0,0,0.3);
  position: relative;
`;

const TestBtn = styled.div`
  font-size: 14px;
  z-index: 2;
  position: absolute;
  left: 20px;
  bottom: 40px;
  cursor: pointer;
  width: 200px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #D6D6D6;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  border-radius: 3px;
  background: #ffffff;
  &:hover {
    background: #f7f7f7;
  }
`;

const AREA_SIZE = 100;
const API_KEY_YMAPS = 'fd1cea5d-2179-4ca3-948a-55b839aa8c79';

const DlMap = () => {

  let entranceRef = '';
  let pointRef = '';

  const [pointCoords, setPointCoords] = useState([]);
  const [entranceCoords, setEntranceCoords] = useState([]);
  const [showArea, setShowArea] = useState(false);
  const [pointAddress, setPointAddress] = useState('');

  const [mapRef, setMapRef] = useState(null);
  const [ymaps, setYmaps] = useState(null);


  // !!! ВЫДЕЛИТЬ В ОБЩИЙ ХУК!!!!!!
  const fetchAddressByCoords = (coords) => {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY_YMAPS}&format=json&geocode=${coords}`
  
      fetch(url)
        .then(r => r.json())
        .then(res => {
          if (res) {
            const defaultAddress = 
              res.response.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData.text;
            setPointAddress(defaultAddress);
          }
        })
        .catch(e => {
          console.log('ERROR >>>>>>', e);
        });
  }


  useEffect(() => {
    if (ymaps && mapRef) {
      ymaps.geolocation.get({
        mapStateAutoApply: true
      })
      .then(function(result) {
        if (result) {
          console.log('>>>>>>>>>', result);
          const coords = result.geoObjects.position;
          mapRef.setCenter(coords, 16);
          setPointCoords(coords);

          fetchAddressByCoords([...coords].reverse().join('+'));

        }
      });
    }
  }, [ymaps, mapRef])

  // const SetTestCoords = () => {
  //   const myCoords = [59.840921599999994, 30.493900800000002];
  //   const myZoom = 16;

  //   setPointCoords(myCoords);
  //   mapRef.setCenter(myCoords, myZoom);
  // }

  const specifyEntrance = () => {
    setShowArea(!showArea);
    if (showArea) setEntranceCoords([]);
  }

  const mapClick = e => {
    if (!showArea) {
      const coords = e.get('coords');
      setPointCoords(coords);
    }
  }

  const moveEntrance = () => {
    const newCoords = entranceRef.geometry.getCoordinates();
    const distance = ymaps.coordSystem.geo.getDistance(newCoords, pointCoords);
    if (distance > AREA_SIZE) {
      setEntranceCoords([]);
    } else {
      setEntranceCoords(newCoords);
    }
  }

  const movePoint = () => {
    const newCoords = pointRef.geometry.getCoordinates();
    setPointCoords(newCoords);
    fetchAddressByCoords([...newCoords].reverse().join('+'));
  }

  const circleClick = e => {
    const coords = e.get('coords');
    setEntranceCoords(coords);
  }

  const selectAddress = (item) => {
    const { address, coords } = item;
    const coordArr = coords.split(' ').reverse();
    const zoom = 17;
    setPointCoords(coordArr);
    setPointAddress(address);
    mapRef.setCenter(coordArr, zoom);
  }

  return (
    <YMaps query={{ apikey: API_KEY_YMAPS }}>
      <MapWrap>
        { 
          pointCoords && pointCoords.length 
            ? (
              <TestBtn onClick={specifyEntrance}>
                { entranceCoords && entranceCoords.length ? 'Скрыть область' : 'Уточнить подъезд' }
              </TestBtn>
            ) : ''
        }
        <Search selectAddress={selectAddress} pointAddress={pointAddress} />
        <Map
          modules={['geolocation', 'geocode', 'coordSystem.geo']}
          onLoad={setYmaps}
          onClick={mapClick}
          width={'100%'}
          height={'500px'}
          defaultState={{ center: [55.75, 37.57], zoom: 12 }}
          instanceRef={setMapRef}
        >
          <GeolocationControl options={{ float: 'left' }} />
          {
            pointCoords && pointCoords.length ? (
              <Placemark
                modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                onDragend={movePoint}
                geometry={pointCoords}
                options={{ draggable: !showArea }}
                properties={{
                  hintContent: pointAddress,
                  balloonContent: 'Адрес отправления - дополнительная информация'
                }}
                instanceRef={ref => (pointRef = ref)}
              />
            ) : ''
          }
          {
            pointCoords && pointCoords.length && showArea ? (
              <Circle
                geometry={[pointCoords, AREA_SIZE]}
                onClick={circleClick}
                options={{
                  draggable: false,
                  fillColor: '#FFD2D2',
                  fillOpacity: 0.4,
                  strokeColor: '#FFD2D2',
                  strokeOpacity: 0.7,
                  strokeWidth: 1,
                }}
              />
            ) : '' 
          }
          {
            entranceCoords && entranceCoords.length ? (
              <Placemark
                modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                geometry={entranceCoords}
                onDragend={moveEntrance}
                options={{
                  draggable: true,
                  preset: 'islands#dotIcon',
                  iconColor: '#ef2c2c',
                }}
                properties={{
                  hintContent: 'Подъезд',
                  balloonContent: 'Подъезд - дополнительная информация',
                }}
                instanceRef={ref => (entranceRef = ref)}
              />
            ) : ''
          }
        </Map>
      </MapWrap>
    </YMaps>
  )
}

export default DlMap;