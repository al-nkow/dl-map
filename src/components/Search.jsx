import React from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  width: 80%;
  height: 64px;
  background: #ffffff;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 2;
  border: 1px solid #D6D6D6;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
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
  padding: 0 20px 0 174px;
  font-size: 16px;
  position: relative;
  z-index: 2;
  background: transparent;
`;

const Placeholder = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translate(0, -50%);
  z-index: 1;
`;

const Search = () => {
  const keyPressHandler = e => {
    console.log('>>>>>>>', e.keyCode);
  }

  return (
    <Wrap>
      <StyledInput type="text" onKeyDown={keyPressHandler} />
      <Placeholder>Адрес отправления:</Placeholder>
    </Wrap>
  )
}

export default Search;