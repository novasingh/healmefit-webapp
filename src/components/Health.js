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
import icon1 from '../assets/Icon.png';
import icon2 from '../assets/Icon (1).png'


const { Option } = Select;


const CLIENT_ID = '23PGQL';
const CLIENT_SECRET = '4ea0a9b6e679a00b512ee8478e94385d';

const Health = () => {
  const [AddModal, setAddModal] = useState(false);
  const [isDevicePaired, setIsDevicePaired] = useState(false);
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
  const HealthMetric = ({ icon, title, value, subtext, status, statusColor, recommendation }) => (
    <div style={{padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px'}}>
      <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px"}}>
        {icon}
        <span style={{fontSize: "16px", fontWeight: 600}}>{title}</span>
      </div>
      <div style={{fontSize: "32px", fontWeight: 700}}>{value}</div>
      <div style={{color: "#6B7280", fontSize: "14px"}}>{subtext}</div>
      <div style={{color: statusColor, fontSize: "14px", marginTop: "5px"}}>
        {status} <span style={{color: "#6B7280"}}>{recommendation}</span>
      </div>
    </div>
  );

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
          setIsDevicePaired(true);
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
  const handleUnpairDevice = () => {
    // Logic to unpair the device, e.g., removing tokens
    localStorage.removeItem('fitbitAccessToken');
    localStorage.removeItem('fitbitRefreshToken');
    setIsDevicePaired(false);
    setHaveTokens(false);
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
    <div style={{ height: "100%" }}>
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
  <Option value="1d">Today</Option>
  <Option value="1w">Last 7 Days</Option>
  <Option value="1m">Last 30 Days</Option>
</Select>
<Button 
  onClick={handleSyncClick} 
  style={{ width: "150px", height: "40px", color: "#1FA6E0", border: "1.5px solid #1FA6E0", fontWeight: "600" }}
>
  Sync
</Button>
{!isDevicePaired ? (
            <Button onClick={handleFitbitAuth} type="primary" style={{ height: '40px' }} >Pair Device</Button>
          ) : (
            <Button onClick={handleUnpairDevice} type="danger" style={{ backgroundColor: '#d3d3d3', height: '40px', color: '#000' }}>Unpair Device</Button>
          )}        </div>
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
      {/* Top row with Age, Height, Weight */}
      <Col span={5}>
        <div style={{padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px'}}>
          <div style={{color: "#6B7280", fontSize: "14px", marginBottom: '4px', marginLeft: 80}}>Age</div>
          <div style={{fontSize: "24px", fontWeight: 700, marginLeft: 80}}>{profileData?.age || 21}</div>
        </div>
      </Col>
      <Col span={5}>
        <div style={{padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px'}}>
          <div style={{color: "#6B7280", fontSize: "14px", marginBottom: '4px', marginLeft: 80}}>Height</div>
          <div style={{fontSize: "24px", fontWeight: 700, marginLeft: 70}}>{profileData?.height || 187.9}</div>
        </div>
      </Col>
      <Col span={5}>
        <div style={{padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px'}}>
          <div style={{color: "#6B7280", fontSize: "14px", marginBottom: '4px', marginLeft: 80}}>Weight</div>
          <div style={{fontSize: "24px", fontWeight: 700, marginLeft: 70}}>{profileData?.weight || 180} lb</div>
        </div>
      </Col>

      {/* Left column with health metrics */}
      <Col span={12}>
        <Row gutter={[16, 16]}>
          <Col span={10}>
            <HealthMetric
              icon={<HeartFilled style={{color: "#8B5CF6", fontSize: "20px"}} />}
              title="Resting Heart Rate"
              value={`${heartData?.restingHeartRate || 61} bpm`}
              subtext="Daily average"
              status="Excellent"
              statusColor="#10B981"
              recommendation="(40-75bpm)"
            />
          </Col>
          <Col span={10}>
            <HealthMetric
              icon={<MoonFilled style={{color: "#3B82F6", fontSize: "20px"}} />}
              title="Sleep"
              value={`${sleepData?.hours || 5}h ${sleepData?.minutes || 45}m`}
              subtext="Last night"
              status="Fair"
              statusColor="#F59E0B"
              recommendation="(Recommended 7-9h)"
            />
          </Col>
          <Col span={10}>
  <HealthMetric
    icon={
      <img 
        src={icon1}
        alt="icon" 
        style={{ color: "#10B981", fontSize: "20px", width: "20px", height: "20px" }} 
      />
    }
    title="Steps"
    value={stepData?.steps || 4050}
    subtext="Daily average"
    status="Poor"
    statusColor="#EF4444"
    recommendation="(Recommended 10,000)"
  />
</Col>

          <Col span={10}>
            <HealthMetric
              icon={
                <img 
                  src={icon2}
                  alt="icon" 
                  style={{ color: "#10B981", fontSize: "20px", width: "20px", height: "20px" }} 
                />
              }
              title="BMI"
              value={profileData?.bmi || 20.3}
              subtext="Last 7 Days"
              status="Good"
              statusColor="#10B981"
              recommendation="(18.5 - 24.9)"
            />
          </Col>
        </Row>
      </Col>

      {/* Right column with chart */}
      <Col span={12}>
        <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'auto'}}>
          <Chart options={chartOptions.options} series={chartOptions.series} type="radialBar" height={550} width={500} />
        </div>
      </Col>
    </Row>

{/* <Col lg={24} md={24} style={{display:"flex", justifyContent:"center", marginTop: "20px"}}>
  <Chart options={chartOptions.options} series={chartOptions.series} type="radialBar" height={350} width={350} />
</Col> */}
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
