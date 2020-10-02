import React, { useState } from 'react';
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
  cursor: pointer;
  width: 200px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #333333;
  border-radius: 3px;
  margin-bottom: 20px;
  background: #dedede;
  &:hover {
    background: #b9b9b9;
  }
`;

const AREA_SIZE = 500;

const DlMap = () => {

  // ymaps.coordSystem.geo.getDistance(moscowCoords, newYorkCoords)


  let mapRef = '';
  let entranceRef = '';
  let pointRef = '';

  const [pointCoords, setPointCoords] = useState([]);
  const [entranceCoords, setEntranceCoords] = useState([]);
  const [showArea, setShowArea] = useState(false);
  const [ymaps, setYmaps] = useState(null);

  const onLoadMap = (map) => {
    // const location = window.ymaps.geolocation.get(
    //   { mapStateAutoApply: true },
    // )
    
    setYmaps(map);
    // ymaps.coordSystem.geo.getDistance(moscowCoords, newYorkCoords)







    // ловим клик по карте
    // mapRef.events.add('click', (e) => {
    //   const coords = e.get('coords');
    //   setPointCoords(coords);
    // });









    
    // ymaps.geolocation
    //   .get({ provider: 'browser', mapStateAutoApply: true })
    //   .then(result => {
    //     console.log('GEO RESULT >>>>>>>', result);
    //     // ymaps.geocode(result.geoObjects.position).then(res => {
    //     //   let firstGeoObject = res.geoObjects.get(0);
    //     //   console.log(
    //     //     firstGeoObject.getLocalities().length
    //     //       ? firstGeoObject.getLocalities()
    //     //       : firstGeoObject.getAdministrativeAreas()
    //     //   );
    //     // })
    //   }).catch(e => console.log('XXXXXX >>>>>>>', e));


      // Определение геопозиции!!!!
      // ymaps.geolocation.get({
      //   mapStateAutoApply: true
      // })
      // .then(function(result) {
      //   console.log('WTF >>>>>', result);
      // });
  }


  const SetTestCoords = () => {
    const myCoords = [59.8412181111507, 30.490725064525773];
    const myZoom = 14;

    setPointCoords(myCoords);
    mapRef.setCenter(myCoords, myZoom);
  }

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
  }

  const circleClick = e => {
    const coords = e.get('coords');
    setEntranceCoords(coords);
  }

  return (
    <YMaps query={{ apikey: 'fd1cea5d-2179-4ca3-948a-55b839aa8c79' }}>
      <TestBtn onClick={SetTestCoords}>Установить координаты</TestBtn>
      <TestBtn onClick={specifyEntrance}>Уточнить подъезд</TestBtn>
      <div>{pointCoords[0]} - {pointCoords[1]} - {showArea ? 'true' : 'false'}</div>
      <div>{entranceCoords[0]} - {entranceCoords[1]}</div>
      <MapWrap>
        <Search />
        <Map
          modules={['geolocation', 'geocode', 'coordSystem.geo']}
          onLoad={(inst) => onLoadMap(inst)}
          onClick={mapClick}
          width={'100%'}
          height={'500px'}
          defaultState={{ center: [55.75, 37.57], zoom: 9 }}
          instanceRef={ref => (mapRef = ref)}
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
                  hintContent: 'Это хинт',
                  balloonContent: 'Это балун'
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
                  hintContent: 'Уточнение подъезда',
                  balloonContent: 'Это балун подъезда',
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