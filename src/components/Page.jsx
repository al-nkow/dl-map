// HTTPS=true npm start

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import UseDebouncedFunc from './UseDebounced';

const Wrap = styled.div`
  position: relative;
  margin-bottom: 40px;
  padding-right: 100px;
`;

const SelectBtn = styled.div`
  cursor: pointer;
  width: 90px;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #23629a;
  color: #ffffff;
  border-radius: 4px;
  &:hover {
    background: #2a73b5;
  }
`;

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

const ENTER_KEY_CODE = 13;

// TODO: Add select city input
const pointStorageVal = {
  cashlessOnly: "0",
  city: "Санкт-Петербург",
  cityID: 200601,
  code: "7800000000000000000000000",
  country_code: 643,
  fullName: "г. Санкт-Петербург",
  inPrice: "1",
  isAutoCity: "1",
  isTerminal: "1",
  label: "г. Санкт-Петербург",
  nameString: "Санкт-Петербург г",
  noSendDoor: "0",
  regionString: "г. Санкт-Петербург",
  street: "1",
  uString: "",
  value: "Санкт-Петербург",
};

const Page = ({ set }) => {
  const [value, setValue] = useState('');
  const [prevSuggestions, setPrevSuggestions] = useState('');
  const [cdiOptions, setCdiOptions] = useState('');

  const onChangeHandler = e => {
    setValue(e.target.value);
  }












  const getQuery = () => {
    var filteredSuggestions = !!prevSuggestions && prevSuggestions.length
      ? prevSuggestions.filter((el) => {
          const locationCode =  el.settlement_kladr_id || el.city_kladr_id;
  
          return locationCode === pointStorageVal.code;
        })
      : [];
  
    var query = [];
    var filteredQuery = [];

    console.log('PREV SUGGESTIONS >>>>>>>>>', prevSuggestions, filteredSuggestions);
  
    if (prevSuggestions.length
      && filteredSuggestions.length) {
        prevSuggestions.forEach(function (elem) {
          const str = [
            elem.region_with_type ? elem.region_with_type : '',
            elem.area_with_type ? elem.area_with_type : '',
            elem.city_with_type ? elem.city_with_type : '',
            elem.settlement_with_type ? elem.settlement_with_type : '',
            value
          ].filter(Boolean).join(' ');
  
          query.push(str);
        });
    } else if (prevSuggestions.length
      && !filteredSuggestions.lengt) {
        const pointStr = [
          pointStorageVal && pointStorageVal.regionString ? pointStorageVal.regionString : '',
          pointStorageVal && pointStorageVal.uString ? pointStorageVal.uString.split(',')[0] : '',
          pointStorageVal && pointStorageVal.nameString ? pointStorageVal.nameString : '',
          value
        ].filter(Boolean).join(' ');
  
        query.push(pointStr);
  
        prevSuggestions.forEach(function (elem) {
          var str = [
            elem.region_with_type ? elem.region_with_type : '',
            elem.area_with_type ? elem.area_with_type : '',
            elem.city_with_type ? elem.city_with_type : '',
            elem.settlement_with_type ? elem.settlement_with_type : '',
            value
          ].filter(Boolean).join(' ');
  
          query.push(str);
        });

    } else if (!prevSuggestions.length) {
      const pointStr = [
        pointStorageVal && pointStorageVal.regionString ? pointStorageVal.regionString : '',
        pointStorageVal && pointStorageVal.uString ? pointStorageVal.uString.split(',')[0] : '',
        pointStorageVal && pointStorageVal.fullName ? pointStorageVal.fullName : '',
        value
      ].filter(Boolean).join(' ');
  
      query.push(pointStr);
    }
  
    query.forEach(function (el) {
      if (filteredQuery.indexOf(el) === -1) {
        filteredQuery.push(el);
      }
    })
  
    return filteredQuery;
  };




  const fetchAddress = val => {

    console.log('PIZDA >>>>>>>>>', val);

    // Здесь передаем через e.target так как если использовать через стейт - то здесь
    // всегда будет предыдущее значение
    // TODO переделать чрез useEffect!!!!! - когда value меняется - тогда и делаем запрос!!!!
    const url = `https://www.dellin.test/api/v1/address/search`;
    const data = {
      restrict_value: true,
      count: 20,
      query: val,
      locations_boost: [{ kladr_id:"78" }], // ???
      locations: [{ kladr_id:"78" },{ kladr_id:"78" },{ kladr_id:"47" }], // ???
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
        console.log('RESULT >>>>>>', res);
        const adresses = res.data.map(i => ({ kladrId: i.kladr_id, value: i.value}));
        setCdiOptions(adresses);





        var kladrList = {};

        // isErrorResponse = typeof isErrorResponse === "boolean"
        //   ? isErrorResponse
        //   : false;
      
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



















  const keyPressHandler = e => {
    // const {keyCode} = e;


    // if (!lastValue) {
    //   setPrevSuggestions('');
    // } else {
    //   console.log('debouncedFetchAddress >>>>>>>', lastValue);
    //   debouncedFetchAddress(lastValue);
    // }

    // const isSpb = true;
    // const cityIsInRussia = true;
    // const code = pointStorageVal.code;
    // const cityCode = code.length === 24 ? code : `0${code}`;
    // const noStreet = pointStorageVal.street === '0';

    // if (keyCode === ENTER_KEY_CODE) {
    //   if (!value) prevSuggestions('');
      
      
      
      
      // const url = `https://www.dellin.test/api/v1/address/search`


     

      
      
      // const data = {
      //   "query":"твер",
      //   "restrict_value":true,
      //   "count":20,
      //   "data":[
      //     "г Москва г Москва твер",
      //     "Московская обл г Балашиха твер",
      //     "Московская обл г Дубна твер",
      //     "Московская обл г Мытищи твер",
      //     "Московская обл г Серпухов деревня Тверитино твер",
      //     "Московская обл г Можайск деревня Твердики твер"
      //   ],
      //   "locations_boost":[{"kladr_id":"77"}],
      //   "locations":[{"kladr_id":"77"},{"kladr_id":"50"},{"kladr_id":"77"}]
      // };
  
      
    // };
  }

  const selectOption = option => {
    setValue(option.value);
    setCdiOptions('');
  }

  const clickSelectButton = () => {
    const addr1 = 'Россия, г Санкт-Петербург, Ленинский пр-кт 1';
    set(addr1); // value
  }

  // TODO: сделать чтобы запрос не на каждое изменение value срабатывал!
  useEffect(() => {
    if (!value) {
      setPrevSuggestions('');
    } else {
      debouncedFetchAddress(value);
    }
  }, [value, debouncedFetchAddress])

  

  return (
    <Wrap>
      <SelectBtn onClick={clickSelectButton}>Add</SelectBtn>
      <Inp type="text" onChange={onChangeHandler} value={value} onKeyDown={keyPressHandler} />
      {cdiOptions && (
        <Options>
          {cdiOptions.map(item => (
            <Option onClick={() => selectOption(item)} key={item.kladrId}>{item.value}</Option>
          ))}
        </Options>
      )}
    </Wrap>
  );
}

export default Page;