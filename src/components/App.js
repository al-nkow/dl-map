import React, { useState } from 'react';
import DlMap from './DlMap';
import Page from './Page';
import styled from 'styled-components';

const Wrap = styled.div`
  width: 800px;
  margin: 0 auto;
  padding: 40px 10px 100px 10px;
`;

function App() {
  const [cdiAddress, setCdiAddress] = useState('');

  return (
    <Wrap>
      <Page set={setCdiAddress} />
      <DlMap cdi={cdiAddress} width="100%" />
    </Wrap>
  );
}

export default App;
