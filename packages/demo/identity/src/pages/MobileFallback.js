import React from 'react';
import { identityBlue } from '../constants/colors';
import Rate3Logo from './../assets/rate3Logo.svg';
import OnboardImg1 from './../assets/OnboardImg1.svg';

const Container = (props) => {
  return (
    <div style={{ width: '75%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {props.children}
    </div>
  );
} 
const MobileFallback = () => {
  const backgroundStyle = {
    backgroundColor: identityBlue,
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
  };
  return (
    <div style={backgroundStyle}>
      <Container>
        <div style={{ paddingTop: '10vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <img src={Rate3Logo} style={{ height: '5vh' }} alt="rate3 logo" />
          <p style={{ textAlign: 'center', fontWeight: 200, fontSize: '5vh', color: 'white' }}>CROSS-CHAIN IDENTITY DEMO</p>
        </div>        
      </Container>
      <Container><img style={{ height: '25vh' }} src={OnboardImg1} alt="rate3 logo" /></Container>
      <Container>
        <div style={{ paddingBottom: '10vh' }}>
          <p style={{ textAlign: 'center', fontSize: '3.8vh', color: 'white' }}>Only on Desktop Browsers</p>
          <p style={{ textAlign: 'center', fontSize: '3vh', color: 'white' }}>Bookmark and try it on Desktop</p>
        </div>
        
      </Container>
    </div>
  );
};

export default MobileFallback;
