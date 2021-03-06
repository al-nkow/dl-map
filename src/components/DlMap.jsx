import React, { useState, useEffect, useRef } from 'react';
import { YMaps, Map, GeolocationControl, ZoomControl, Placemark } from 'react-yandex-maps';
import styled from 'styled-components';
import Terminals from './Terminals';
import UseDebouncedFunc from './UseDebounced';
import { ReactComponent as Warning } from '../warning.svg'

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
  ${({ manual }) => (manual ? 'color: green;' : '')}
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
  svg {
    margin-top: -2px;
    display: block;
    width: 20px;
    float: left;
    margin-right: 6px;
  }
`;

const ErrMesg = styled.div`
  border-radius: 2px;
  margin-top: 5px;
  padding: 5px 10px;
  font-size: 14px;
  background: #e02626;
  color: #ffffff;
  position: absolute;
  top: 100%;
  left: 10px;
  svg {
    margin-top: -2px;
    display: block;
    width: 20px;
    float: left;
    margin-right: 6px;
    path {
      fill: #ffffff;
    }
  }
`;

const API_KEY_YMAPS = process.env.REACT_APP_MAP_API_KEY;
const BASE_URL = process.env.NODE_ENV === 'development' ? '' : 'https://www.dellin.stage';
const API_ADDRESSATOR = `${BASE_URL}/api/v2/address/`;

const DlMap = ({ setToast }) => {
  const browserGeo = useRef('');

  const [pointCoords, setPointCoords] = useState([]);
  const [pointAddress, setPointAddress] = useState('');

  const [manulaInp, setManualInp] = useState(false);
  const [mapRef, setMapRef] = useState(null);
  const [ymaps, setYmaps] = useState(null);
  const [pointRef, setPointRef] = useState(null);
  const [isTerminal, setIsTerminal] = useState(false);

  const [value, setValue] = useState('');
  const [options, setOptions] = useState(null);
  const [showError, setShowError] = useState('');

  const fetchAddress = (val, options, clean) => {
    setShowError('');
    setIsTerminal(false);
    return fetch(`${API_ADDRESSATOR}?query=${Array.isArray(val) ? val.join(',') : val}${options || ''}${!clean ? browserGeo.current : ''}`)
      .then(r => r.json())
  }

  const standartize = (addr) => {
    fetchAddress(addr, 'books=cdi_clean', true)
      .then(res => {
        const hasCity = res.data[0].components.find(i => i.kind === 'city');
        const hasSettelment = res.data[0].components.find(i => i.kind === 'settelment');
        if (hasCity || hasSettelment) {
          const cityName = hasCity.name ? ` ${hasCity.name}` : '';
          const settelmentName = hasSettelment.name ? ` ${hasSettelment.name}` : '';
          setShowError(`Ваш населенный пункт${cityName}${settelmentName}. Цена перевозки ориентировочная`);
        } else {
          setShowError('Требуется уточнение возможности перевозки и цены');
        }
      })
      .catch(err => console.log('ERROR: ', err));
  }

  const checkAddress = (res) => {
    const hasHouse = res.data[0].components.find(i => i.kind === 'house');
    const unofficial = res.data[0].books.includes('yandex_geo');
    if (unofficial) {
      standartize(res.data[0].result);
    } else if (!hasHouse) {
      setShowError('Не указан номер дома');
    }
  }

  const mapClick = e => setPoint(e.get('coords'));

  const movePoint = () => setPoint(pointRef.geometry.getCoordinates());

  const debouncedFetchAddress = UseDebouncedFunc((val) => {
    fetchAddress(val).then(res => {
      if (res && res.data) {
        const opts = [...res.data];
        if ((res.data[0] && res.data[0].books.includes('cdi_clean')) || !res.data.length) {
          opts.push({ result: 'Нет в списке', property: { kladr_id: 'manualInp' } })
        }
        setOptions(opts);
      }
    }).catch(err => console.log('ERROR: ', err));
  }, 300);

  const onChangeHandler = (e) => {
    const val = e.target.value;
    setValue(val);
    if (val) debouncedFetchAddress(val);
  }

  const selectOption = (opt) => {
    if (opt.property.kladr_id === 'manualInp') {
      standartize(value);
      setManualInp(true);
      setOptions(null);
      return;
    }
    
    setValue(opt.result);
    setOptions(null);
    if (opt.books.includes('cdi_clean')) {
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
        if (res && res.data && res.data[0]) {
          setValue(res.data[0].result);
          setPointAddress(res.data[0].result);
          checkAddress(res);
        } else {
          setValue('');
          setPointAddress('');
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
          browserGeo.current = `&location_priority=${coords.join(',')}`;
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

  useEffect(() => {
    setManualInp(false);
  }, [value]);

  return (
    <YMaps query={{ apikey: API_KEY_YMAPS }}>
      <InpWrap>
        <Input onChange={onChangeHandler} value={value} type="text" placeholder="Адрес" />
        {isTerminal && (
          <TerminalMesg>
            <Warning />
            Отправка из терминала
          </TerminalMesg>
        )}
        {!isTerminal && showError && (
          <ErrMesg>
            <Warning />
            {showError}
          </ErrMesg>
        )}
        {options && (
          <Options>
            {options.map(item => (
              <Option
                key={item.property.kladr_id}
                onClick={() => selectOption(item)}
                manual={item.property.kladr_id === 'manualInp'}
              >
                {item.result}
              </Option>
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
            !manulaInp && pointCoords && pointCoords.length ? (
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