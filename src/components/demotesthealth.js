import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Row, Spin, Select, Modal } from 'antd';
import Header from './Header';
import back from '../assets/backicon.png';
import { useNavigate } from 'react-router-dom';
import { get, post } from "../utility/httpService";
import { AuthContext } from '../contexts/AuthContext';
import { calculateHealthScore, isTokenExpired } from '../utility/utils';
import Chart from 'react-apexcharts';
import { fetchDeviceData, fetchHeartDetail, fetchProfileData, fetchSleepData, fetchStepData } from '../utility/fitbitServices';
import { HeartFilled, MoonFilled, StepForwardOutlined, CalculatorOutlined } from '@ant-design/icons';


const { Option } = Select;


const CLIENT_ID = '23PGQL';
const CLIENT_SECRET = '4ea0a9b6e679a00b512ee8478e94385d';

const Health = (props) => {
  const [AddModal, setAddModal] = useState(false);
  const navigate = useNavigate();
  const clientId = CLIENT_ID;
  const redirectUri = 'http://localhost:3000/callback';
  const scope = 'activity nutrition profile settings sleep heartrate';
  const fitbitAuthUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&expires_in=604800`;

  const { userData } = useContext(AuthContext);
  const [heartData, setHeartData] = useState();
  const [deviceData, setDeviceData] = useState();
  const [stepData, setStepData] = useState();
  const [profileData, setProfileData] = useState();
  const [sleepData, setSleepData] = useState();
  const [haveTokens, setHaveTokens] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('1d'); // Default to one day

  const handleFitbitAuth = () => {
    window.location.href = fitbitAuthUrl;
  };

  const handleBackClick = () => {
    navigate('/driver');
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('fitbitRefreshToken');
  
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    try {
      const response = await fetch('https://api.fitbit.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
        },
        body: body.toString(),
      });
  
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
  
      const data = await response.json();
      localStorage.setItem('fitbitAccessToken', data.access_token);
      localStorage.setItem('fitbitRefreshToken', data.refresh_token);
      
      await post(`/fitbit/${userData.id}`, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: userData.id,
        type: data.token_type,
        expires: data.expires_in,
        code: 'N/A'
      });

      getUserFitbitTokens()
    } catch (error) {
      console.error('Error refreshing access token:', error);
    }
  };

  const fetchAllData = async () => {
    const token = localStorage.getItem('fitbitAccessToken');
    if (!token) return;

    try {
      // Modify the API calls to pass the selected time range if needed
      const [profile, device, heart, sleep, steps] = await Promise.all([
        fetchProfileData(token),
        fetchDeviceData(token),
        fetchHeartDetail(token, timeRange),
        fetchSleepData(token, timeRange),
        fetchStepData(token, timeRange)
      ]);

      setProfileData(profile);
      setDeviceData(device);
      setHeartData(heart?.['activities-heart']?.[0]?.value);
      setSleepData(sleep);
      setStepData(steps);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getUserFitbitTokens = async () => {
    setLoading(true);
    try {
      const response = await get(`/fitbit/${userData.id}`);
      if (response.data) {
        if (isTokenExpired(response.data.accessToken)) {
          await refreshAccessToken();
        } else {
          localStorage.setItem('fitbitAccessToken', response.data.accessToken);
          localStorage.setItem('fitbitRefreshToken', response.data.refreshToken);
          await fetchAllData();
          setHaveTokens(true);
        }
      }
    } catch (error) {
      if (error.code === 404) {
        setHaveTokens(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserFitbitTokens();
  }, []);

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  const handleSyncClick = async () => {
    await fetchAllData();
  };

  const heartRate = heartData?.restingHeartRate || 61;
  const heartRatePercentage = (heartRate / 100) * 100;

  const sleepHours = 5;
  const sleepMinutes = 45;
  const totalSleepMinutes = (sleepHours * 60) + sleepMinutes;
  const sleepPercentage = (totalSleepMinutes / 1440) * 100;

  const chartOptions = {
    series: [heartRatePercentage, sleepPercentage.toFixed(0), 80, 79],
    options: {
      chart: {
        height: '500px',
        width: '500px',
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '50%',
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
              fontSize: '16px',
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
              fontSize: '18px',
              formatter: function (w) {
                return Math.round(calculateHealthScore(profileData?.user?.age, 21, 78, 4000, 7) * 100);
              }
            }
          },
          stroke: {
            lineCap: 'round', // Make the ends of the strokes round
            width: 50, // Increase the stroke width
          }
        },
      },
      labels: ['Heart Rate', 'Sleep', 'BMI', 'Steps'],
    },
  };

  return loading ? (
    <Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Spin />
    </Col>
  ) : (
    <div className={props.class} style={{ height: "100%" }}>
      <Header />
      <Col lg={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "25px", color: "#0B5676", letterSpacing: "1px", fontWeight: "600", marginBottom: '10px', marginTop: "3%" }}>
          {userData?.role === 'manager' ? 
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <img src={back} style={{ color: "#1FA6E0", cursor: "pointer" }} onClick={handleBackClick} height={30} width={30} /> 
              Health
            </div> : 
            'Health'}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Select 
  defaultValue="1d" 
  onChange={handleTimeRangeChange} 
  style={{ width: "150px", height: "40px" }}  // Consistent width and height
>
  <Option value="1d">One Day</Option>
  <Option value="1w">One Week</Option>
  <Option value="1m">One Month</Option>
</Select>
<Button 
  onClick={handleSyncClick} 
  style={{ width: "150px", height: "40px", color: "#1FA6E0", border: "1.5px solid #1FA6E0", fontWeight: "600" }}
>
  Sync
</Button>
        </div>
      </Col>
      {!haveTokens ? (
        <Col lg={24} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
          <Col lg={10} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "600" }}>Looks like we have not added a device yet.</div>
            <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "400" }}>Add a device to sync your health data.</div>
            <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}>+ Add</Button>
          </Col>
        </Col>
      ) : (
        <>
          <Row gutter={[16, 16]}>
  <Col lg={24} md={24}>
    <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '20px', display:"flex", justifyContent:"space-around"}}>
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"5px"}}>
        <div style={{color:"#BBBBBB", fontSize:"16px"}}>Age</div>
        <div style={{fontSize:"24px", fontWeight:700}}>{profileData?.user?.age}</div>
      </div>
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"5px"}}>
        <div style={{color:"#BBBBBB", fontSize:"16px"}}>Height</div>
        <div style={{fontSize:"24px", fontWeight:700}}>{String(profileData?.user?.height).split('.')[0]}"</div>
      </div>
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"5px"}}>
        <div style={{color:"#BBBBBB", fontSize:"16px"}}>Weight</div>
        <div style={{fontSize:"24px", fontWeight:700}}>{profileData?.user?.weight} lb</div>
      </div>
    </div>
  </Col>
  <Col lg={12} md={12}>
    <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '20px'}}>
      <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px"}}>
        <HeartFilled style={{color: "#8B5CF6", fontSize: "24px"}} />
        <span style={{fontSize:"18px", fontWeight:600}}>Resting Heart Rate</span>
      </div>
      <div style={{fontSize:"36px", fontWeight:700}}>{heartData?.restingHeartRate || 61} bpm</div>
      <div style={{color:"#BBBBBB", fontSize:"14px"}}>Daily Average</div>
      <div style={{color:"#10B981", fontSize:"14px", marginTop:"5px"}}>Excellent</div>
    </div>
  </Col>
<Col lg={12} md={12}>
    <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '20px'}}>
      <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px"}}>
        <MoonFilled style={{color: "#3B82F6", fontSize: "24px"}} />
        <span style={{fontSize:"18px", fontWeight:600}}>Sleep</span>
      </div>
      <div style={{fontSize:"36px", fontWeight:700}}>{sleepHours}h {sleepMinutes}m</div>
      <div style={{color:"#BBBBBB", fontSize:"14px"}}>Last Night</div>
      <div style={{color:"#F59E0B", fontSize:"14px", marginTop:"5px"}}>Fair</div>
    </div>
  </Col>  
  <Col lg={12} md={12}>
  <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '20px'}}>
    <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px"}}>
      <StepForwardOutlined style={{color: "#10B981", fontSize: "24px"}} />
      <span style={{fontSize:"18px", fontWeight:600}}>Steps</span>
    </div>
    <div style={{fontSize:"36px", fontWeight:700}}>{stepData?.steps || 4050}</div>
    <div style={{color:"#BBBBBB", fontSize:"14px"}}>Daily Average</div>
    <div style={{color:"#EF4444", fontSize:"14px", marginTop:"5px"}}>Poor</div>
  </div>
</Col>
  <Col lg={12} md={12}>
    <div style={{borderRadius:"8px", border:"0.4px solid #d9d9d9", padding: '20px'}}>
      <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px"}}>
        <CalculatorOutlined style={{color: "#3B82F6", fontSize: "24px"}} />
        <span style={{fontSize:"18px", fontWeight:600}}>BMI</span>
      </div>
      <div style={{fontSize:"36px", fontWeight:700}}>20.3</div>
      <div style={{color:"#BBBBBB", fontSize:"14px"}}>Last calculated 7/26/23</div>
      <div style={{color:"#10B981", fontSize:"14px", marginTop:"5px"}}>Good</div>
    </div>
  </Col>
</Row>
<Col lg={24} md={24} style={{display:"flex", justifyContent:"center", marginTop: "20px"}}>
  <Chart options={chartOptions.options} series={chartOptions.series} type="radialBar" height={350} width={350} />
</Col>
        </>
      )}
      <Modal centered={true} open={AddModal} footer={null} onCancel={() => setAddModal(false)}>
        <Row>
          <div style={{width: '100%'}}>
            <h2 style={{textAlign:"center", color:"#0B5676"}}>Add a new device</h2>
            <div style={{display:"flex", justifyContent:"center", margin: '30px 0px'}}>
              <Button style={{width: "50%", height: "40px", color: "#1FA6E0", border:"1.5px solid #1FA6E0",fontWeight:"600" }} onClick={handleFitbitAuth}>Fitbit</Button>
            </div>
          </div>
        </Row>
      </Modal>
    </div>
  );
};

export default Health;
