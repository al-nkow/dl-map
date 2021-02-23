import React, { useEffect, Fragment } from 'react';
import ReactDOMServer from 'react-dom/server';
import terminals from '../contacts.json';
import { Placemark } from 'react-yandex-maps';
import styled from 'styled-components';

const Button = styled.div`
  padding: 5px 10px;
  text-align: center;
  background: #f38a69;
  color: #ffffff;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background: #e07f61;
  }
`;

const Wrap = styled.div`
  width: 260px;
`;

const Name = styled.div`
  margin-bottom: 10px;
`;

const Phone = styled.div`
  font-weight: bold;
  margin-top: 5px;
`;

const Wortable = styled.div`
  margin-top: 5px;
`;

const Terminals = ({ selectTerminal, pointCoords }) => {
  const balloonClickHandler = (e) => {
    const element = e.target;

    if (element.classList.contains('select-terminal')) {
      const { lat, lon, address } = element.dataset;
      selectTerminal([lat, lon], address);
    }
  }

  const terminalSelected = item => {
    return pointCoords && +pointCoords[0] === item.terminal.latitude && +pointCoords[1] === item.terminal.longitude;
  }

  useEffect(() => {
    document.addEventListener('click', balloonClickHandler);
    return () => document.removeEventListener('click', balloonClickHandler);
  }, []);

  if (!terminals || !terminals.length) return '';

  return (
    <>{
      terminals.map((item) => (
        <Fragment key={item.id}>
          {
            !terminalSelected(item) ? (<Placemark
              key={item.id}
              geometry={[item.terminal.latitude, item.terminal.longitude]}
              properties={{
                hintContent: `${item.city} ${item.address}`,
                balloonContentBody: ReactDOMServer.renderToStaticMarkup(
                  <Wrap>
                    <b>г. {item.city}</b><br />
                    <Name>Название терминала: {item.name}</Name>
                    {item.terminal.terminalAddress}
                    {item.show_phones && item.show_phones.length 
                      ? item.show_phones.map((item, i) => <Phone key={i}>{item}</Phone>)
                      : ''}
                    {item.worktables && item.worktables[0] && item.worktables[0].work_hours
                      ? (<Wortable>Режим работы: <b>{item.worktables[0].work_hours}</b></Wortable>)
                      : ''}
                    <Button
                      data-address={item.terminal.terminalAddress}
                      data-lat={item.terminal.latitude}
                      data-lon={item.terminal.longitude}
                      className="select-terminal"
                    >
                      Выбрать
                    </Button>
                  </Wrap>,
                ),
              }}
              options={{
                preset: 'islands#dotIcon',
                iconColor: '#e84d6f',
              }}
            />) : ''
          }
        </Fragment>
      ))
    }</>
  )
};

export default Terminals;