import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  width: 80%;
  height: 64px;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 2;
`;

const InpWrap = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 1px solid #D6D6D6;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  background: #ffffff;
  border-radius: 4px;
  overflow: hidden;
`;

const StyledInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: none;
  box-shadow: none;
  outline: none;
  padding: 0 20px 0 180px;
  font-size: 16px;
  position: relative;
  z-index: 2;
  background: transparent;
`;

const Placeholder = styled.span`
  position: absolute;
  font-weight: bold;
  left: 10px;
  top: 50%;
  transform: translate(0, -50%);
  z-index: 1;
`;

const Options = styled.div`
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  top: 100%;
  background: #ffffff;
  margin-top: 5px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
`;

const Option = styled.div`
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: #e4e4e4;
  }
`;

const ENTER_KEY_CODE = 13;
const API_KEY_YMAPS = process.env.REACT_APP_MAP_API_KEY;
const GEO_BASE_URL = `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY_YMAPS}&format=json&geocode=`;

const Search = ({ selectAddress, pointAddress, cdi }) => {
  const [variants, setVariants] = useState([]);
  const [value, setInpValue] = useState('');

  const geoCode = (cdiAddr) => {
    const valueAddr = cdiAddr || value;
    const searchAddr = valueAddr.split(' ').join('+');
    const url = `${GEO_BASE_URL}${searchAddr}`;

    fetch(url)
      .then(r => r.json())
      .then(res => {
        if (res) {
          const geoObjects = res.response.GeoObjectCollection.featureMember;
          const found = geoObjects.map(item => {
            return {
              address: item.GeoObject.metaDataProperty.GeocoderMetaData.text,
              coords: item.GeoObject.Point.pos,
            }
          })

          if (found.length === 1) {
            selectOption(found[0]);
          } else {
            setVariants(found);
          }
        }
      })
      .catch(e => {
        console.log('ERROR >>>>>>', e);
      });
  }

  const keyPressHandler = e => {
    const {keyCode} = e;
    if (keyCode === ENTER_KEY_CODE) geoCode();
  }

  const changeHandler = e => {
    setInpValue(e.target.value);
  }

  const selectOption = opt => {
    selectAddress(opt);
    setInpValue(opt.address);
    setVariants([]);
  }

  useEffect(() => {
    if (pointAddress) setInpValue(pointAddress);
  }, [pointAddress]);









  useEffect(() => {
    if (cdi) {
      setInpValue(cdi);
      geoCode(cdi);
    }
  }, [cdi]);







  
  return (
    <Wrap>
      <InpWrap>
        <StyledInput
          type="text"
          value={value}
          onChange={changeHandler}
          onKeyDown={keyPressHandler}
        />
        <Placeholder>Адрес отправления:</Placeholder>
      </InpWrap>
      {
        variants && variants.length ? (
          <Options>
            {variants.map(item => (
              <Option key={item.address} onClick={() => selectOption(item)}>{item.address}</Option>
            ))}
          </Options>
        ) : ''
      }
    </Wrap>
  )
}

export default Search;