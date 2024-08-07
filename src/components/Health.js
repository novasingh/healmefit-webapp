import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Modal, Row, Spin } from 'antd';
import Header from './Header';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { get, post, remove } from "../utility/httpService";
import { AuthContext } from '../contexts/AuthContext';
import { calculateHealthScore, isTokenExpired } from '../utility/utils';
import { useNavigate } from 'react-router-dom';

const Health = (props) => {
  
  const clientId = '23PGQL';
  const redirectUri = 'http://localhost:3000/callback';
  const scope = 'activity nutrition profile settings sleep heartrate';

  const fitbitAuthUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&expires_in=604800`;

  const navigate = useNavigate()
  const [AddModal, setAddModal] = useState(false);
  const [heartData, setHeartData] = useState();
  const [deviceData, setDeviceData] = useState();
  const [stepData, setStepData] = useState();
  const [profileData, setProfileData] = useState();
  const [sleepData, setSleepData] = useState();
  const { userData} = useContext(AuthContext);
  const [haveTokens, setHaveTokens] = useState(false)
 const [loading, setLoading] = useState(false)


  const handleFitbitAuth = () => {
    window.location.href = fitbitAuthUrl;
  };


  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('fitbitAccessToken');
      if (!token) {
        throw new Error('Authentication token is missing.');
      }
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
      if (!token) {
        throw new Error('Authentication token is missing.');
      }
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
      if (!token) {
        throw new Error('Authentication token is missing.');
      }
      const response = await axios.get('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
  
      if (response.data['activities-heart'] && response.data['activities-heart'][0]) {
        const heartData = response.data['activities-heart'][0].value;
        setHeartData(heartData);
      } else {
        console.error('No heart data available for today');
      }
    } catch (error) {
      console.error('Error fetching heart data:', error);
    }
  };

  const fetchSleepData = async () => {
    try {
      const token = localStorage.getItem('fitbitAccessToken');
      if (!token) {
        throw new Error('Authentication token is missing.');
      }
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
      if (!token) {
        throw new Error('Authentication token is missing.');
      }
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

  const getUserFitbitTokens = async() => {
    setLoading(true)
    await get(`/fitbit/${userData.id}`).then((response) => {
       if(response.data){
        if(isTokenExpired(response.data.accessToken)){
          navigate(`/callback?code=${response.data.code}`)
        }else{
          localStorage.setItem('fitbitAccessToken', response.data.accessToken);
          localStorage.setItem('fitbitRefreshToken', response.data.refreshToken);
          setHaveTokens(true)
          fetchStepData();
          fetchDeviceData();
          fetchSleepData();
          fetchHeartDetail();
          fetchProfileData();
        }
       }
       setLoading(false)
    }, error => {
      if(error.code === 404){
        setHaveTokens(false)
        setLoading(false)
      }
    })
  }

  useEffect(() => {
    getUserFitbitTokens();
  }, []);

  const chartOptions = {
    series: [70, 55, 65, 80], // Add values for Sleep, BMI, and Steps
    options: {
      chart: {
        height: 800, // Increased height for bigger chart
        type: 'radialBar',
        width: '100%', // Ensure the chart uses the full width of its container
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '60%', // Adjust size for medium circles
          },
          track: {
            show: true,
            strokeWidth: '20%', // Adjust the thickness of the track
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: '20px', // Increase font size for name
              color: undefined,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '18px', // Increase font size for value
              color: 'black',
              offsetY: 10,
              formatter: function (val) {
                return val + '%';
              }
            },
            total: {
              show: true,
              label: 'Health Score',
              color: 'black',
              fontSize: '18px', // Increase font size for total label
              formatter: function (w) {
                return Math.round(calculateHealthScore(profileData?.user?.age ,21, 78, 4000, 7)*100);
              }
            }
          },
          stroke: {
            lineCap: 'round', // Make the ends of the strokes round
            width: 50, // Increase the stroke width
          }
        },
      },
      labels: ['Heart Rate', 'Sleep', 'BMI', 'Steps'], // Add labels for the new circles
    },
  };
  
  

  return loading ? (
    <Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
       <Spin />
    </Col>
  ): (
    <div className={props.class} style={{ height: "100%" }}>
      <Header />
      <Col lg={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "25px", color: "#0B5676", letterSpacing: "1px", fontWeight: "600", marginBottom: '10px', marginTop: "3%" }}>Health</h3>
        <Button style={{width: "10%", height: "40px", color: "#1FA6E0", border:"1.5px solid #1FA6E0",fontWeight:"600" }}>Sync</Button>
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
                  <div style={{fontSize:"16px",fontWeight:"400", paddingBottom:"10%"}}>Resting Heart Rate</div>
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
                  <div style={{fontSize:"20px", fontWeight:700}}>4020</div>
                  <div  style={{color:"#BBBBBB", fontSize:"10px"}}>Daily Average</div>
                </div>
              </div>
            </div>
            <div style={{width:"50%"}}>
              <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '5%'}}> 
                <div style={{display:"flex", flexDirection:"column",gap:"5px"}}>
                  <div style={{fontSize:"16px",fontWeight:"400", paddingBottom:"10%"}}>Calories Burned</div>
                  <div style={{fontSize:"20px", fontWeight:700}}>2200</div>
                  <div  style={{color:"#BBBBBB", fontSize:"10px"}}>Daily Average</div>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col lg={12} style={{display:"flex", justifyContent:"center"}}>
        { profileData?.user &&  <Chart
            options={chartOptions.options}
            series={chartOptions.series}
            type="radialBar"
            height={350}
          />}
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
