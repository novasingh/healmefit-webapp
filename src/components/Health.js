import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Row, Spin, Select, Modal } from "antd";
import Header from "./Header";
import back from "../assets/backicon.png";
import { useNavigate } from "react-router-dom";
import { get, post, updatePatch } from "../utility/httpService";
import { AuthContext } from "../contexts/AuthContext";
import {
  calculateAverages,
  calculateBMI,
  calculateHealthScore,
  calculateSleepPercentage,
  convertDecimalHours,
  getHeartRateType,
  getSleepAnalysis,
  getWeightStatus,
  isTokenExpired,
} from "../utility/utils";
import Chart from "react-apexcharts";
import {
  fetchDeviceData,
  fetchHeartDetail,
  fetchProfileData,
  fetchSleepData,
  fetchStepData,
} from "../utility/fitbitServices";
import { HeartFilled, MoonFilled } from "@ant-design/icons";
import icon1 from "../assets/sleep-hmf.webp";
import icon2 from "../assets/BMI-hmf.webp";

const { Option } = Select;

const Health = () => {
  const [AddModal, setAddModal] = useState(false);
  const [isDevicePaired, setIsDevicePaired] = useState(false);
  const navigate = useNavigate();
  const fitbitAuthUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${
    process.env.REACT_APP_FITBIT_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.REACT_APP_FITBIT_REDIRECT_URI
  )}&scope=${encodeURIComponent(
    process.env.REACT_APP_FITBIT_SCOPE
  )}&expires_in=604800`;

  const [healthData, setHealthData] = useState({});
  const { userData } = useContext(AuthContext);
  const [heartData, setHeartData] = useState();
  const [deviceData, setDeviceData] = useState();
  const [stepData, setStepData] = useState();
  const [profileData, setProfileData] = useState();
  const [sleepData, setSleepData] = useState();
  const [haveTokens, setHaveTokens] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("1d"); // Default to one day
  const HealthMetric = ({
    icon,
    title,
    value,
    subtext,
    status,
    statusColor,
    recommendation,
  }) => (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        {icon}
        <span style={{ fontSize: "16px", fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ fontSize: "32px", fontWeight: 700 }}>{value}</div>
      <div style={{ color: "#6B7280", fontSize: "14px" }}>{subtext}</div>
      <div style={{ color: statusColor, fontSize: "14px", marginTop: "5px" }}>
        {status} <span style={{ color: "#6B7280" }}>{recommendation}</span>
      </div>
    </div>
  );

  const handleFitbitAuth = () => {
    window.location.href = fitbitAuthUrl;
  };

  const handleBackClick = () => {
    navigate("/driver");
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("fitbitRefreshToken");

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.REACT_APP_FITBIT_CLIENT_ID,
      client_secret: process.env.REACT_APP_FITBIT_CLIENT_SECRET,
    });

    try {
      const response = await fetch("https://api.fitbit.com/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(
            `${process.env.REACT_APP_FITBIT_CLIENT_ID}:${process.env.REACT_APP_FITBIT_CLIENT_SECRET}`
          )}`,
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      localStorage.setItem("fitbitAccessToken", data.access_token);
      localStorage.setItem("fitbitRefreshToken", data.refresh_token);

      await post(`/fitbit/${userData.id}`, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: userData.id,
        type: data.token_type,
        expires: data.expires_in,
        code: "N/A",
      });

      getUserFitbitTokens();
    } catch (error) {
      console.error("Error refreshing access token:", error);
    }
  };

  // async function fetchDataForDateRange(token, timeRange) {
  //   const { startDate, endDate } = timeRange;
  //   const dateArray = [];
  //   let currentDate = new Date(startDate);
  
  //   while (currentDate <= new Date(endDate)) {
  //     dateArray.push(currentDate.toISOString().split('T')[0]); // Convert date to YYYY-MM-DD format
  //     currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  //   }
  
  //   const results = await Promise.all(
  //     dateArray.map(async (date) => {
  //       const [heart, sleep, steps] = await Promise.all([
  //         fetchHeartDetail(token, { date }), // Pass the date to your API
  //         fetchSleepData(token, { date }),   // Pass the date to your API
  //         fetchStepData(token, { date }),    // Pass the date to your API
  //       ]);
  //       return { heart, sleep, steps };
  //     })
  //   );
  
  //   return results;
  // }

  const fetchAllData = async () => {
    const token = localStorage.getItem("fitbitAccessToken");
    if (!token) return;

    try {

      // Fetch all data in parallel
      const [profile, device, heart, sleep, steps] = await Promise.all([
        fetchProfileData(token),
        fetchDeviceData(token),
        fetchHeartDetail(token, timeRange),
        fetchSleepData(token, timeRange),
        fetchStepData(token, timeRange),
      ]);

      // Update state with fetched data
      setProfileData(profile);
      setDeviceData(device);

      const healthScore = Math.round(
        calculateHealthScore(
          profile?.user?.age,
          calculateBMI(
            profile?.user?.weight || 65,
            profile?.user?.height
          ),
          heart["activities-heart"][0]?.value?.restingHeartRate,
          profile?.user?.averageDailySteps,
          sleep?.summary?.totalTimeInBed / 60
        ) * 100
      );

      const bmiData = calculateBMI(
        profile?.user?.weight || 65,
        profile?.user?.height
      )

      const data = {
        age: profile?.user?.age,
        sleep: sleep?.summary?.totalTimeInBed,
        steps: profile?.user?.averageDailySteps,
        heartRate: heart["activities-heart"][0]?.value?.restingHeartRate,
        bmi: +bmiData,
        healthScore: healthScore
      };

      setHealthData(data);
      // Post health data
      updatePatch(`/users/${userData.id}`, {
        healthData: data,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
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
          localStorage.setItem("fitbitAccessToken", response.data.accessToken);
          localStorage.setItem(
            "fitbitRefreshToken",
            response.data.refreshToken
          );
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
    localStorage.removeItem("fitbitAccessToken");
    localStorage.removeItem("fitbitRefreshToken");
    setIsDevicePaired(false);
    setHaveTokens(false);
  };
  const heartRate = healthData?.heartRate || 72;
  const heartRatePercentage = Math.round((heartRate / 78) * 100);

  const avgSteps = (profileData?.user?.averageDailySteps / 10000) * 100;

  const chartOptions = {
    series: [
      heartRatePercentage,
      calculateSleepPercentage(healthData?.sleep),
      Math.round(
        (calculateBMI(
          profileData?.user?.weight || 65,
          profileData?.user?.height
        ) /
          25) *
          100
      ).toFixed(2),
      avgSteps > 100 ? 100 : Math.round(avgSteps),
    ],
    options: {
      chart: {
        height: "500px",
        width: "500px",
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "50%",
          },
          track: {
            show: true,
            strokeWidth: "20%", // Adjust the thickness of the track
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: "20px", // Increase font size for name
              color: undefined,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "16px",
              color: "black",
              offsetY: 10,
              formatter: function (val) {
                return val + "%";
              },
            },
            total: {
              show: true,
              label: "Health Score",
              color: "black",
              fontSize: "18px",
              formatter: function (w) {
                return  healthData?.healthScore
              },
            },
          },
          stroke: {
            lineCap: "round", // Make the ends of the strokes round
            width: 50, // Increase the stroke width
          },
        },
      },
      labels: ["Heart Rate", "Sleep", "BMI", "Steps"],
    },
  };

  
  return loading ? (
    <Col
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Spin />
    </Col>
  ) : (
    <div style={{ height: "100%" }}>
      <Header />
      <Col
        lg={24}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            fontSize: "25px",
            color: "#0B5676",
            letterSpacing: "1px",
            fontWeight: "600",
            marginBottom: "10px",
            marginTop: "3%",
          }}
        >
          {userData?.role === "manager" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <img
                src={back}
                style={{ color: "#1FA6E0", cursor: "pointer" }}
                alt="img back"
                onClick={handleBackClick}
                height={30}
                width={30}
              />
              Health
            </div>
          ) : (
            "Health"
          )}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Select
            defaultValue="1d"
            onChange={handleTimeRangeChange}
            style={{ width: "150px", height: "40px" }} // Consistent width and height
          >
            <Option value="1d">Today</Option>
            <Option value="1w">Last 7 Days</Option>
            <Option value="1m">Last 30 Days</Option>
          </Select>
          <Button
            onClick={handleSyncClick}
            style={{
              width: "150px",
              height: "40px",
              color: "#1FA6E0",
              border: "1.5px solid #1FA6E0",
              fontWeight: "600",
            }}
          >
            Sync
          </Button>
          {!isDevicePaired ? (
            <Button
              onClick={handleFitbitAuth}
              type="primary"
              style={{ height: "40px" }}
            >
              Pair Device
            </Button>
          ) : (
            <Button
              onClick={handleUnpairDevice}
              type="danger"
              style={{
                backgroundColor: "#d3d3d3",
                height: "40px",
                color: "#000",
              }}
            >
              Unpair Device
            </Button>
          )}{" "}
        </div>
      </Col>
      {!haveTokens ? (
        <Col
          lg={24}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80%",
          }}
        >
          <Col
            lg={10}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                textAlign: "center",
                color: "#BBBBBB",
                fontWeight: "600",
              }}
            >
              Looks like we have not added a device yet.
            </div>
            <div
              style={{
                textAlign: "center",
                color: "#BBBBBB",
                fontWeight: "400",
              }}
            >
              Add a device to sync your health data.
            </div>
            <Button
              onClick={() => setAddModal(true)}
              style={{
                background: "#1FA6E0",
                width: "100%",
                height: "40px",
                color: "#fff",
              }}
            >
              + Add
            </Button>
          </Col>
        </Col>
      ) : (
        <>
          {profileData?.user?.age ? (
            <Row gutter={[16, 16]}>
              {/* Top row with Age, Height, Weight */}
              <Col span={5}>
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      color: "#6B7280",
                      fontSize: "14px",
                      marginBottom: "4px",
                      marginLeft: 80,
                    }}
                  >
                    Age
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      marginLeft: 80,
                    }}
                  >
                    {profileData?.user?.age || "N/A"}
                  </div>
                </div>
              </Col>
              <Col span={5}>
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      color: "#6B7280",
                      fontSize: "14px",
                      marginBottom: "4px",
                      marginLeft: 80,
                    }}
                  >
                    Height
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      marginLeft: 70,
                    }}
                  >
                    {Math.trunc(profileData?.user.height) || "N/A"}
                  </div>
                </div>
              </Col>
              <Col span={5}>
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      color: "#6B7280",
                      fontSize: "14px",
                      marginBottom: "4px",
                      marginLeft: 80,
                    }}
                  >
                    Weight
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      marginLeft: 70,
                    }}
                  >
                    {profileData?.user?.weight
                      ? profileData?.user?.weight + "lb"
                      : "0"}
                  </div>
                </div>
              </Col>

              {/* Left column with health metrics */}
              <Col span={12}>
                <Row gutter={[16, 16]}>
                  <Col span={10}>
                    <HealthMetric
                      icon={
                        <HeartFilled
                          style={{ color: "#8B5CF6", fontSize: "20px" }}
                        />
                      }
                      title="Resting Heart Rate"
                      value={
                        healthData?.heartRate
                          ? `${healthData?.heartRate} bpm`
                          : "N/A"
                      }
                      subtext="Daily average"
                      status="Excellent"
                      statusColor="#10B981"
                      recommendation={getHeartRateType(healthData?.age, healthData?.heartRate)}
                    />
                  </Col>
                  <Col span={10}>
                    <HealthMetric
                      icon={
                        <MoonFilled
                          style={{ color: "#3B82F6", fontSize: "20px" }}
                        />
                      }
                      title="Sleep"
                      value={
                        healthData?.sleep
                          ? convertDecimalHours(healthData?.sleep)
                          : "N/A"
                      }
                      subtext="Last night"
                      status={getSleepAnalysis(healthData?.age, healthData.sleep).status || ''}
                      statusColor={getSleepAnalysis(healthData?.age, healthData.sleep).color || ''}
                     recommendation="(Recommended 7-9h)"
                    />
                  </Col>
                  <Col span={10}>
                    <HealthMetric
                      icon={
                        <img
                          src={icon1}
                          alt="icon"
                          style={{
                            color: "#10B981",
                            fontSize: "20px",
                            width: "20px",
                            height: "20px",
                          }}
                        />
                      }
                      title="Steps"
                      value={ healthData?.steps || "N/A"}
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
                          style={{
                            color: "#10B981",
                            fontSize: "20px",
                            width: "20px",
                            height: "20px",
                          }}
                        />
                      }
                      title="BMI"
                      value={
                        healthData?.bmi
                          ?  healthData?.bmi
                          : "N/A"
                      }
                      subtext="Last 7 Days"
                      status={getWeightStatus(healthData?.bmi).status || ''}
                      statusColor={getWeightStatus(healthData?.bmi).color || ''}
                      recommendation={getWeightStatus(healthData?.bmi)?.range || ''}
                    />
                  </Col>
                </Row>
              </Col>

              {/* Right column with chart */}
              <Col span={12}>
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "auto",
                  }}
                >
                  <Chart
                    options={chartOptions.options}
                    series={chartOptions.series}
                    type="radialBar"
                    height={550}
                    width={500}
                  />
                </div>
              </Col>
            </Row>
          ) : (
            <Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%'}}>
              <p style={{fontSize: '20px'}}>
                Sorry we don't have data access now please refresh the page or
                Try again later.
              </p>
            </Col>
          )}
        </>
      )}
      <Modal
        centered={true}
        open={AddModal}
        footer={null}
        onCancel={() => setAddModal(false)}
      >
        <Row>
          <div style={{ width: "100%" }}>
            <h2 style={{ textAlign: "center", color: "#0B5676" }}>
              Add a new device
            </h2>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "30px 0px",
              }}
            >
              <Button
                style={{
                  width: "50%",
                  height: "40px",
                  color: "#1FA6E0",
                  border: "1.5px solid #1FA6E0",
                  fontWeight: "600",
                }}
                onClick={handleFitbitAuth}
              >
                Fitbit
              </Button>
            </div>
          </div>
        </Row>
      </Modal>
    </div>
  );
};

export default Health;
