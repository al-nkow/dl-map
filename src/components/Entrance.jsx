import React from 'react';
import styled from 'styled-components';
import { Placemark, Circle } from 'react-yandex-maps';

const Button = styled.div`
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

const Entrance = ({ pointCoords, ymaps, entranceCoords, setEntranceCoords, showArea, setShowArea }) => {
  let entranceRef = '';

  const specifyEntrance = () => {
    setShowArea(!showArea);
    if (showArea) setEntranceCoords([]);
  }

  const circleClick = e => {
    const coords = e.get('coords');
    setEntranceCoords(coords);
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

  return (
    <>
      {/* { 
        pointCoords && pointCoords.length 
          ? (
            <Button onClick={specifyEntrance}>
              { entranceCoords && entranceCoords.length ? 'Скрыть область' : 'Уточнить подъезд' }
            </Button>
          ) : ''
      } */}
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
    </>
  )
};

export default Entrance;