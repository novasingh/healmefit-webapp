import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Modal, Row } from 'antd';
import Header from './Header';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { get } from "../utility/httpService";
import { AuthContext } from '../contexts/AuthContext';

const Health = (props) => {

  const clientId = '23PGQL';
  const redirectUri = 'http://localhost:3000/callback';
  const scope = 'activity nutrition profile settings sleep heartrate';

  const fitbitAuthUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&expires_in=604800`;

  const [AddModal, setAddModal] = useState(false);
  const [heartData, setHeartData] = useState();
  const [deviceData, setDeviceData] = useState();
  const [stepData, setStepData] = useState();
  const [profileData, setProfileData] = useState();
  const [sleepData, setSleepData] = useState();
  const { userData } = useContext(AuthContext);
  const [haveTokens, setHaveTokens] = useState(false);

  const handleFitbitAuth = () => {
    window.location.href = fitbitAuthUrl;
  };

  const getUserFitbitTokens = async () => {
    try {
      const response = await get(`/fitbit/${userData.id}`);
      if (response.data) {
        localStorage.setItem('fitbitAccessToken', response.data.accessToken);
        localStorage.setItem('fitbitRefreshToken', response.data.refreshToken);
        setHaveTokens(true);
        fetchAllData();
      } else {
        setHaveTokens(false);
      }
    } catch (error) {
      if (error.code === 404) {
        setHaveTokens(false);
      } else {
        console.error('Failed to get Fitbit tokens:', error);
      }
    }
  };

  const fetchAllData = () => {
    fetchProfileData();
    fetchDeviceData();
    fetchHeartDetail();
    fetchSleepData();
    fetchStepData();
  };

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('fitbitAccessToken');
      if (!token) throw new Error('Authentication token is missing.');

      const response = await axios.get('https://api.fitbit.com/1/user/-/profile.json', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const fetchDeviceData = async () => {
    try {
      const token = localStorage.getItem('fitbitAccessToken');
      if (!token) throw new Error('Authentication token is missing.');

      const response = await axios.get('https://api.fitbit.com/1/user/-/devices.json', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setDeviceData(response.data);
    } catch (error) {
      console.error('Error fetching device data:', error);
    }
  };

  const fetchHeartDetail = async () => {
    try {
      const token = localStorage.getItem('fitbitAccessToken');
      if (!token) throw new Error('Authentication token is missing.');

      const response = await axios.get('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setHeartData(response.data);
    } catch (error) {
      console.error('Error fetching heart data:', error);
    }
  };

  const fetchSleepData = async () => {
    try {
      const token = localStorage.getItem('fitbitAccessToken');
      if (!token) throw new Error('Authentication token is missing.');

      const response = await axios.get('https://api.fitbit.com/1.2/user/-/sleep/date/2020-01-01.json', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setSleepData(response.data);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
    }
  };

  const fetchStepData = async () => {
    try {
      const token = localStorage.getItem('fitbitAccessToken');
      if (!token) throw new Error('Authentication token is missing.');

      const response = await axios.get('https://api.fitbit.com/1/user/-/activities/goals/daily.json', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setStepData(response.data);
    } catch (error) {
      console.error('Error fetching step data:', error);
    }
  };

  useEffect(() => {
    getUserFitbitTokens();
  }, []);

  const heartRate = heartData?.activitiesheart?.[0]?.value?.restingHeartRate || 61;
  const heartRatePercentage = (heartRate / 100) * 100;

  const sleepHours = 5;
  const sleepMinutes = 45;
  const totalSleepMinutes = (sleepHours * 60) + sleepMinutes;
  const sleepPercentage = (totalSleepMinutes / 1440) * 100;

  const chartOptions = {
    series: [heartRatePercentage, sleepPercentage.toFixed(0), 80, 79, 85],
    options: {
      chart: {
        height: 500,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '40%',
          },
        },
      },
      labels: [`Heart Rate ${heartRate} bpm`, `Sleep ${sleepHours}h ${sleepMinutes}m`, 'series 3', 'series 4', 'series 5'],
    },
  };
  return (
    <div className={props.class} style={{ height: "100%" }}>
      <Header />
      <Col lg={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "25px", color: "#0B5676", letterSpacing: "1px", fontWeight: "600", marginBottom: '10px', marginTop: "3%" }}>Health</h3>
        <Button onClick={fetchAllData} style={{width: "10%", height: "40px", color: "#1FA6E0", border:"1.5px solid #1FA6E0",fontWeight:"600" }}>Sync</Button>
      </Col>
      {!haveTokens ? 
      <Col lg={24} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
        <Col lg={10} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "600" }}>Looks like we have not added a device yet.</div>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "400" }}>Add a device to sync your health data.</div>
          <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}>+ Add</Button>
        </Col>
      </Col>
      : <>
      <Row gutter={[16,16]} lg={24}>
        <Col lg={12}>
          <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '5%', display:"flex" ,gap:"20%", justifyContent:"center"}}> 
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"5px"}}>
              <div style={{color:"#BBBBBB", fontSize:"16px"}}>Age</div>
              <div style={{fontSize:"16px", fontWeight:700}}>{profileData?.user?.age}</div>
            </div>
            <div style={{display:"flex", flexDirection:"column", alignItems:"center" , gap:"5px"}}>
              <div  style={{color:"#BBBBBB", fontSize:"16px"}}>Height</div>
              <div style={{fontSize:"16px", fontWeight:700}}>{String(profileData?.user?.height).split('.')[0]}</div>
            </div>
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"5px"}}>
              <div  style={{color:"#BBBBBB", fontSize:"16px"}}>Weight</div>
              <div style={{fontSize:"16px", fontWeight:700}}>{profileData?.user?.weight}</div>
            </div>
          </div>
          <div style={{display:"flex", paddingTop:"3%", paddingBottom:"2%", gap:"3%"}}>
            <div style={{width:"50%"}}>
              <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '5%'}}> 
                <div style={{display:"flex", flexDirection:"column",gap:"5px"}}>
                  <div style={{fontSize:"16px",fontWeight:"400", paddingBottom:"10%"}}>Heart Rate</div>
                  <div style={{fontSize:"20px", fontWeight:700}}>61 bpm</div>
                  <div  style={{color:"#BBBBBB", fontSize:"10px"}}>Daily Average</div>
                </div>
              </div>
            </div>
            <div style={{width:"50%"}}>
              <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '5%'}}> 
                <div style={{display:"flex", flexDirection:"column",gap:"5px"}}>
                  <div style={{fontSize:"16px",fontWeight:"400", paddingBottom:"10%"}}>Sleep</div>
                  <div style={{fontSize:"20px", fontWeight:700}}>5h 42m </div>
                  <div  style={{color:"#BBBBBB", fontSize:"10px"}}>Last Night</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:"flex", paddingBottom:"2%", gap:"3%"}}>
            <div style={{width:"50%"}}>
              <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '5%'}}> 
                <div style={{display:"flex", flexDirection:"column",gap:"5px"}}>
                  <div style={{fontSize:"16px",fontWeight:"400", paddingBottom:"10%"}}>Steps</div>
                  <div style={{fontSize:"20px", fontWeight:700}}>{stepData?.goals?.steps}</div>
                  <div  style={{color:"#BBBBBB", fontSize:"10px"}}>Daily Average</div>
                </div>
              </div>
            </div>
            <div style={{width:"50%"}}>
              <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '5%'}}> 
                <div style={{display:"flex", flexDirection:"column",gap:"5px"}}>
                  <div style={{fontSize:"16px",fontWeight:"400", paddingBottom:"10%"}}>Calories Burned</div>
                  <div style={{fontSize:"20px", fontWeight:700}}>{stepData?.goals?.caloriesOut}</div>
                  <div  style={{color:"#BBBBBB", fontSize:"10px"}}>Daily Average</div>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col lg={12} style={{}}>
          <Chart
            options={chartOptions.options}
            series={chartOptions.series}
            type="radialBar"
            height={400}
          />
        </Col>
      </Row>
      </>}
      <Modal open={AddModal} onOk={() => setAddModal(false)} onCancel={() => setAddModal(false)}>
        <Row>
          <div>
            <h2 style={{textAlign:"center", color:"#0B5676"}}>Add a new device</h2>
            <div style={{display:"flex", justifyContent:"center"}}>
              <Button style={{width: "50%", height: "40px", color: "#1FA6E0", border:"1.5px solid #1FA6E0",fontWeight:"600" }} onClick={handleFitbitAuth}>Fitbit</Button>
            </div>
          </div>
        </Row>
      </Modal>
    </div>
  );
}

export default Health;
