import React, { useEffect, useState, useRef } from 'react';
import DlMap from './DlMap';
import Page from './Page';
import styled from 'styled-components';

const Wrap = styled.div`
  width: 800px;
  margin: 0 auto;
  padding: 40px 10px 100px 10px;
`;

const Toast = styled.div`
  width: 300px;
  padding: 10px 20px;
  color: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 1px 10px rgba(0,0,0,0.3);
  position: fixed;
  right: 30px;
  bottom: 30px;
  background: #e04439;
  z-index: 100;
  font-size: 14px;

  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      right: -100px;
    }
    to {
      opacity: 1;
      right: 30px;
    }
  }
`;

function App() {
  const [cdiAddress, setCdiAddress] = useState('');
  const [toast, setToast] = useState('');
  const ref = useRef(null);


  useEffect(() => {
    clearTimeout(ref.current);
    ref.current = setTimeout(() => {
      setToast(false);
    }, 2000);
    return () => {
      clearTimeout(ref.current);
    }
  }, [toast]);

  const showToast = () => {
    setToast(true);
  }

  return (
    <Wrap>
      {toast && <Toast>Невозможно осуществить доставку в эту точку. Укажите адрес доставки внутри области.</Toast>}
      <Page set={setCdiAddress} />
      <DlMap cdi={cdiAddress} width="100%" showToast={showToast} />
    </Wrap>
  );
}

export default App;
