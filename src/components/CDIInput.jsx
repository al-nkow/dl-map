import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import UseDebouncedFunc from './UseDebounced';
import UseCdiService from './UseCdiService';
import WarningSvg from '../warning.svg'

import cities from '../cities.json';
const citiesArr = cities.cities.map(c => c.city);

const Wrap = styled.div`
  position: relative;
  margin-bottom: 40px;
  //padding-right: 100px;
`;

// const SelectBtn = styled.div`
//   cursor: pointer;
//   width: 90px;
//   position: absolute;
//   right: 0;
//   top: 0;
//   bottom: 0;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background: #23629a;
//   color: #ffffff;
//   border-radius: 4px;
//   &:hover {
//     background: #2a73b5;
//   }
// `;

const Inp = styled.input`
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

const ErrMesg = styled.div`
  font-size: 14px;
  padding-top: 4px;
  color: #e02626;
`;

const TerminalMesg = styled.div`
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

const CDIInput = ({ set, yandexResponse, isTerminal, setIsTerminal, setToast }) => {
  const [value, setValue] = useState('');
  const [prevSuggestions, setPrevSuggestions] = useState('');
  const [cdiOptions, setCdiOptions] = useState('');

  const [showError, setShowError] = useState('');

  const onChangeHandler = e => {
    setIsTerminal(false);
    setValue(e.target.value);
  }

  const { getQuery, getCityStr } = UseCdiService(prevSuggestions, value); 

  const fetchAddress = () => {
    const url = `https://www.dellin.stage/api/v1/address/search`;
    const data = {
      restrict_value: true,
      count: 20,
      query: value,
      // locations_boost: [{ kladr_id:"78" }], // ???
      // locations: [{ kladr_id:"78" },{ kladr_id:"78" },{ kladr_id:"47" }], // ???
      data: getQuery()
    };

    fetch(url, {
      method: 'POST', 
      body: JSON.stringify(data),
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin':'*',
        'Content-Type': 'application/json;charset=utf-8',
      }
    })
      .then(r => r.json())
      .then(res => {
        const adresses = res.data.map(i => {
          if (!i.value) i.value = getCityStr(i);
          return i;
        });

        setCdiOptions(adresses);

        const kladrList = {};
      
        const suggestions = res.data.filter(function(el) {
          var suitable = res.type === 'clean' ? el.qc === '0' || el.qc === '1' : true;
          if (!kladrList[el.kladr_id] && suitable) {
            kladrList[el.kladr_id] = true;
            return true;
          } else {
            return false;
          }
        });
        // if (!!searchValue && suggestions.length && type === 'suggest') this._suggestions = suggestions;
        if (suggestions.length && res.type === 'suggest') setPrevSuggestions(suggestions);
      })
      .catch(e => {
        console.log('ERROR >>>>>>', e);
      });
  }

  const debouncedFetchAddress = UseDebouncedFunc(fetchAddress, 300);

  const keyPressHandler = () => {
    // const isSpb = true;
    // const cityIsInRussia = true;
    // const code = pointStorageVal.code;
    // const cityCode = code.length === 24 ? code : `0${code}`;
    // const noStreet = pointStorageVal.street === '0';

    debouncedFetchAddress();
  }

  const selectOption = option => {
    if (!citiesArr.includes(option.city)) setToast('Отправка из этого города не осуществляется!');

    setIsTerminal(false);
    setValue(option.value);
    setCdiOptions('');
    set(option.value);
  }

  // const clickSelectButton = () => {
  //   set(value);
  // }

  useEffect(() => {
    if (!value) setPrevSuggestions('');
  }, [value])

  useEffect(() => {
    setShowError('');

    const url = `https://www.dellin.stage/api/v1/address/search`;
    const data = {
      restrict_value: true,
      count: 20,
      query: yandexResponse, // !!!!
      locations_boost: [{ kladr_id:"78" }], // ???
      locations: [{ kladr_id:"78" },{ kladr_id:"78" },{ kladr_id:"47" }], // ???
      // data: getQuery()
    };

    fetch(url, {
      method: 'POST', 
      body: JSON.stringify(data),
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin':'*',
        'Content-Type': 'application/json;charset=utf-8',
      }
    })
      .then(r => r.json())
      .then(res => {
        if (res && res.data && res.data[0] && res.data[0].result) {
          setValue(res.data[0].result);
          // if (!citiesArr.includes(res.data[0].city)) setToast('Отправка из этого города не осуществляется!');
          if (!res.data[0].house) {
            setShowError('Вы указали адрес без номера дома, если все верно - просто продолжайте заполнять форму');
          }
        }

      })
      .catch(e => console.log('ERROR YANDEX-CDI >>>>>>>', e));
  
  }, [yandexResponse])

  return (
    <Wrap>
      {/* <SelectBtn onClick={clickSelectButton}>Выбрать</SelectBtn> */}
      <Inp type="text" onChange={onChangeHandler} value={value} onKeyUp={keyPressHandler} />
      {isTerminal && (
        <TerminalMesg>
          <img src={WarningSvg} alt="" />
          Отправка из терминала
        </TerminalMesg>
      )}
      {showError && <ErrMesg>{showError}</ErrMesg>}
      {cdiOptions && (
        <Options>
          {cdiOptions.map(item => (
            <Option onClick={() => selectOption(item)} key={item.kladr_id}>{item.value}</Option>
          ))}
        </Options>
      )}
    </Wrap>
  );
}

export default CDIInput;