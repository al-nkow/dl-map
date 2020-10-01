import React from 'react';
import DlMap from './DlMap';
import styled from 'styled-components';

const Wrap = styled.div`
  width: 800px;
  margin: 0 auto;
  padding: 40px 10px 100px 10px;
`;

function App() {
  return (
    <Wrap>
      <DlMap width="100%" />
    </Wrap>
  );
}

export default App;
