import React from 'react';
import { Polygon } from 'react-yandex-maps';

const Zones = ({showArea, setPointCoords, fetchAddressByCoords}) => {
  const areaClick = e => {
    if (!showArea) {
      const coords = e.get('coords');

      setPointCoords(coords);
      fetchAddressByCoords([...coords].reverse().join('+'));
    }
  }

  return (
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
  )
};

export default Zones;