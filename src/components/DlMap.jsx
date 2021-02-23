import React, { useState, useEffect } from 'react';
import { YMaps, Map, GeolocationControl, ZoomControl, Placemark } from 'react-yandex-maps';
import styled from 'styled-components';
import Terminals from './Terminals';
import UseDebouncedFunc from './UseDebounced';
import WarningSvg from '../warning.svg'

const MapWrap = styled.div`
  overflow: hidden;
  border-radius: 3px;
  box-shadow: 0px 1px 10px rgba(0,0,0,0.3);
  position: relative;
`;

const InpWrap = styled.div`
  position: relative;
  margin-bottom: 40px;
`;

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #D6D6D6;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  border-radius: 4px;
  outline: none;
  padding: 10px 20px;
  font-size: 16px;
  background: transparent;
`;

const Options = styled.div`
  overflow-y: auto;
  max-height: 200px;
  top: 100%;
  left: 5px;
  right: 5px;
  background: #ffffff;
  position: absolute;
  z-index: 3;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  margin-top: 10px;
  border-radius: 2px;
`;

const Option = styled.div`
  padding: 5px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #f7f7f7;
  }
`;

const TerminalMesg = styled.div`
  position: absolute;
  top: 100%;
  left: 10px;
  right: 10px;
  padding-left: 3px;
  font-size: 14px;
  padding-top: 4px;
  color: #638844;
  img {
    margin-top: -2px;
    display: block;
    width: 20px;
    float: left;
    margin-right: 6px;
  }
`;

const ErrMesg = styled.div`
  font-size: 14px;
  padding-top: 4px;
  color: #e02626;
  position: absolute;
  top: 100%;
  left: 10px;
  right: 10px;
`;

const API_KEY_YMAPS = process.env.REACT_APP_MAP_API_KEY;
const API_ADDRESSATOR = 'https://www.dellin.stage/api/v2/address/';

const DlMap = ({ setToast }) => {
  const [pointCoords, setPointCoords] = useState([]);
  const [pointAddress, setPointAddress] = useState('');

  const [mapRef, setMapRef] = useState(null);
  const [ymaps, setYmaps] = useState(null);
  const [pointRef, setPointRef] = useState(null);
  const [isTerminal, setIsTerminal] = useState(false);

  const [value, setValue] = useState('');
  const [options, setOptions] = useState(null);
  const [showError, setShowError] = useState('');

  const fetchAddress = (val, options) => {
    setShowError('');
    setIsTerminal(false);
    return fetch(`${API_ADDRESSATOR}/?query=${Array.isArray(val) ? val.join(',') : val}${options || ''}`)
      .then(r => r.json())
  }

  const checkAddress = (res) => {
    const hasHouse = res.data[0].property.components.find(i => i.type === 'д');
    if (!hasHouse) setShowError('Не указан номер дома!');
  }

  const mapClick = e => setPoint(e.get('coords'));

  const movePoint = () => setPoint(pointRef.geometry.getCoordinates());

  const debouncedFetchAddress = UseDebouncedFunc((val) => {
    fetchAddress(val).then(res => {
      if (res && res.data) setOptions(res.data);
    }).catch(err => console.log('ERROR: ', err));
  }, 300);

  const onChangeHandler = (e) => {
    const val = e.target.value;
    setValue(val);
    if (val) debouncedFetchAddress(val);
  }

  const selectOption = (opt) => {
    setValue(opt.result);
    setOptions(null);
    if (opt.books[0] === 'cdi_clean') {
      fetchAddress(opt.result, '&fields=point')
        .then(res => {
          if (res && res.data) {
            const coords = res.data[0].point.split(',');
            const address = opt.result;

            setPointCoords(coords);
            setPointAddress(address);
            mapRef.setCenter(coords, 17);

            checkAddress(res);
          }
        })
        .catch(err => console.log('ERROR: ', err));
    }
  }

  const setPoint = coords => {
    setIsTerminal(false);
    setPointCoords(coords);

    fetchAddress(coords)
      .then(res => {
        if (res && res.data) {
          setValue(res.data[0].result);
          setPointAddress(res.data[0].result);
          checkAddress(res);
        }
      })
      .catch(err => console.log('ERROR: ', err));
  }

  const selectTerminal = (coords, address) => {
    setValue(address);
    setIsTerminal(true);
    setPointCoords(coords);
    setPointAddress(address);
  }

  // Initial Postion bases on geolocation
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
          fetchAddress(coords)
            .then(res => {
              if (res && res.data) {
                setValue(res.data[0].result);
                setPointAddress(res.data[0].result);
              }
            })
            .catch(err => console.log('ERROR: ', err));
        }
      });
    }
  }, [ymaps, mapRef])

  useEffect(() => {
    if (pointCoords && mapRef) mapRef.balloon.close();
  }, [pointCoords, mapRef]);

  return (
    <YMaps query={{ apikey: API_KEY_YMAPS }}>
      <InpWrap>
        <Input onChange={onChangeHandler} value={value} type="text" placeholder="Адрес" />
        {isTerminal && (
          <TerminalMesg>
            <img src={WarningSvg} alt="" />
            Отправка из терминала
          </TerminalMesg>
        )}
        {!isTerminal && showError && <ErrMesg>{showError}</ErrMesg>}
        {options && (
          <Options>
            {options.map(item => (
              <Option onClick={() => selectOption(item)} key={item.property.kladr_id}>{item.result}</Option>
            ))}
          </Options>
        )}
      </InpWrap>
      <MapWrap>
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
                options={{ draggable: true }}
                properties={{
                  hintContent: pointAddress,
                  balloonContent: '<div style="width: 200px;">' + pointAddress + '</div>'
                }}
                instanceRef={setPointRef}
              />
            ) : ''
          }
          <Terminals selectTerminal={selectTerminal} pointCoords={pointCoords} />
          <ZoomControl />
          <GeolocationControl />
        </Map>
      </MapWrap>
    </YMaps>
  )
}

export default DlMap;