import React, { useState, useEffect } from 'react';
import { YMaps, Map, Polygon, GeolocationControl, ZoomControl, Placemark, Circle } from 'react-yandex-maps';
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
  bottom: 20px;
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
const API_KEY_YMAPS = process.env.REACT_APP_MAP_API_KEY;

const DlMap = ({ cdi, showToast }) => {

  let entranceRef = '';
  let pointRef = '';

  const [pointCoords, setPointCoords] = useState([]);
  const [entranceCoords, setEntranceCoords] = useState([]);
  const [showArea, setShowArea] = useState(false);
  const [pointAddress, setPointAddress] = useState('');

  const [mapRef, setMapRef] = useState(null);
  const [ymaps, setYmaps] = useState(null);

  const fetchAddressByCoords = (coords) => {
    // &kind=house&results=1 - определяет адрес как ближайший дом
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY_YMAPS}&format=json&geocode=${coords}&kind=house&results=1`
  
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

  /*
    сейчас эта функция работает и при клике по карте и при клике по полигону
    потом когда будут области - надо оставить только клик по полигону и 
    если клиз вне области - тогда удалять метку!
  */
  const mapClick = e => {
    showToast();
    // if (!showArea) {
    //   const coords = e.get('coords');

    //   setPointCoords(coords);
    //   fetchAddressByCoords([...coords].reverse().join('+'));
    // }
  }

  const areaClick = e => {
    if (!showArea) {
      const coords = e.get('coords');

      setPointCoords(coords);
      fetchAddressByCoords([...coords].reverse().join('+'));
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
    setEntranceCoords([]);
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
        <Search cdi={cdi} selectAddress={selectAddress} pointAddress={pointAddress} />
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
          <ZoomControl />
          <GeolocationControl />
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
                  zIndex: 2,
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
          <Polygon
            geometry={[
              [
                [55.73, 37.54],
                [55.77, 37.54],
                [55.77, 37.67],
                [55.73, 37.66],
              ],
              [
                [59.93727133539923, 30.31255582405088],
                [59.94011379470408, 30.312341247329694],
                [59.9406521117351, 30.319036041030863],
                [59.93724980068361, 30.31950810981749],
              ],
              [
                [59.835406433316464, 30.491914146711682],
                [59.83938078758292, 30.47989785032497],
                [59.845946069213966, 30.483245247175553],
                [59.84663707591772, 30.49749314146265],
                [59.840158322960896, 30.509166115095464],
              ]
            ]}
            options={{
              fillColor: '#23629a',
              // strokeColor: '#000000',
              opacity: 0.3,
              // strokeWidth: 1,
              zIndex: 1,
              // strokeStyle: 'shortdash',
            }}
            onClick={areaClick}
          />
        </Map>
      </MapWrap>
    </YMaps>
  )
}

export default DlMap;