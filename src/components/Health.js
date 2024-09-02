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
  cmToFeetInches,
  convertDecimalHours,
  convertWeightToKg,
  getHeartRateType,
  getSleepAnalysis,
  getStepActivityLevel,
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
  fetchWeightData,
} from "../utility/fitbitServices";
import { HeartFilled, MoonFilled } from "@ant-design/icons";
import icon1 from "../assets/sleep-hmf.webp";
import icon2 from "../assets/BMI-hmf.webp";
import moment from "moment/moment";

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
  const [deviceData, setDeviceData] = useState();
  const [profileData, setProfileData] = useState();
  const [haveTokens, setHaveTokens] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState("1d");
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
        border: "1px solid rgb(242, 242, 242)",
        borderRadius: "12px",
        lineHeight: '28px'
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "40px",
        }}
      >
        {icon}
        <span style={{ fontSize: "18px", fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ fontSize: "32px", fontWeight: 700, marginBottom: '5px' }}>{value}</div>
      <div style={{ color: "#BBBBBB", fontSize: "14px", fontWeight: 700 }}>{subtext}</div>
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

  const fetchAllData = async (s, e, t) => {
    setLoading(true);
    setHealthData({});
    const token = localStorage.getItem("fitbitAccessToken");
    const userId = localStorage.getItem("fitbitUserId");
    if (!token) return;

    try {
      // Fetch all data in parallel
      const [profile, device, heart, sleep, steps] = await Promise.all([
        fetchProfileData(token, userId),
        fetchDeviceData(token, userId),
        fetchHeartDetail(token, userId, s, e, t),
        fetchSleepData(token, userId, s, e, t),
        fetchStepData(token, userId, s, e, t),
      ]);

      // Update state with fetched data
      setProfileData(profile);
      setDeviceData(device);
      let data = {};

      const bmiData = calculateBMI(
        convertWeightToKg(profile?.user?.weight, profile?.user?.weightUnit),
        profile?.user?.height
      );

      if (t === "7d" || t === "30d") {
        const averageData = await calculateAverages(
          sleep?.sleep,
          steps["activities-steps"],
          heart["activities-heart"]
        );
        const healthScore = await calculateHealthScore(
          profile?.user?.age,
          calculateBMI(
            convertWeightToKg(profile?.user?.weight, profile?.user?.weightUnit),
            profile?.user?.height
          ),
          averageData?.avgRestingHeartRate || 62,
          averageData?.avgSteps || 0,
          averageData?.avgTimeInBed / 60
        );

        data = {
          age: profile?.user?.age,
          sleep: averageData?.avgTimeInBed,
          steps: averageData?.avgSteps,
          heartRate: averageData?.avgRestingHeartRate || 62,
          bmi: +bmiData,
          healthScore: healthScore,
        };
      } else {
        const healthScore = await calculateHealthScore(
          profile?.user?.age,
          calculateBMI(
            convertWeightToKg(profile?.user?.weight, profile?.user?.weightUnit),
            profile?.user?.height
          ),
          heart["activities-heart"][0]?.value?.restingHeartRate || 62,
          profile?.user?.averageDailySteps,
          sleep?.summary?.totalTimeInBed / 60
        );

        data = {
          age: profile?.user?.age,
          sleep: sleep?.summary?.totalTimeInBed,
          steps: profile?.user?.averageDailySteps,
          heartRate:
            heart["activities-heart"][0]?.value?.restingHeartRate || 62,
          bmi: +bmiData,
          healthScore: healthScore,
        };
      }

      setHealthData(data);
      // Post health data

      if (t === "1d") {
        updatePatch(`/users/${userData.id}`, {
          healthData: data,
        });
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const getUserFitbitTokens = async () => {
    setLoading(true);
    try {
      const response = await get(`/fitbit/${userData.id}`);
      if (response.data) {
        if (isTokenExpired(response.data.accessToken)) {
          localStorage.setItem(
            "fitbitRefreshToken",
            response.data.refreshToken
          );
          await refreshAccessToken();
        } else {
          localStorage.setItem("fitbitAccessToken", response.data.accessToken);
          localStorage.setItem(
            "fitbitRefreshToken",
            response.data.refreshToken
          );
          localStorage.setItem("fitbitUserId", response.data.fitbitUserId);
          await handleTimeRangeChange("1d");
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

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("fitbitRefreshToken");

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.REACT_APP_FITBIT_CLIENT_ID,
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
        expires: new Date(Date.now() + data.expires_in * 1000),
        fitbitUserId: data?.user_id,
      });

      getUserFitbitTokens();
    } catch (error) {
      console.error("Error refreshing access token:", error);
    }
  };

  useEffect(() => {
    getUserFitbitTokens();
  }, []);

  const handleTimeRangeChange = async (value) => {
    let s, e;
    e = moment().format("YYYY-MM-DD");
    if (value === "1d") {
      s = moment().format("YYYY-MM-DD");
    } else if (value === "2d") {
      s = moment().subtract(1, "days").format("YYYY-MM-DD");
    } else if (value === "7d") {
      s = moment().subtract(7, "days").format("YYYY-MM-DD");
    } else if (value === "30d") {
      s = moment().subtract(30, "days").format("YYYY-MM-DD");
    }

    setFilterDate(value);
    await fetchAllData(s, e, value);
  };

  const handleSyncClick = async () => {
    await fetchAllData("", "", filterDate);
  };
  const handleUnpairDevice = () => {
    // Logic to unpair the device, e.g., removing tokens
    localStorage.removeItem("fitbitAccessToken");
    localStorage.removeItem("fitbitRefreshToken");
    setIsDevicePaired(false);
    setHaveTokens(false);
  };
  const heartRate = healthData?.heartRate || 62;
  const heartRatePercentage = Math.round((heartRate / 78) * 100);

  const avgSteps = (profileData?.user?.averageDailySteps / 10000) * 100;

  const chartOptions = {
    series: [
      heartRatePercentage,
      calculateSleepPercentage(healthData?.sleep),
      Math.round((healthData?.bmi / 25) * 100).toFixed(2),
      avgSteps > 100 ? 100 : Math.round(avgSteps),
    ],
    options: {
      chart: {
      height: '100%',  // Set the height to be responsive
      width: '100%',
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "30%",
          },
          track: {
            show: true,
            strokeWidth: "100%",
            margin: '20px'
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: "20px", // Increase font size for name
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
                const healthScore = Math.round(
                  healthData?.healthScore?.healthScore * 100
                );
                const category = healthData?.healthScore?.category;
                return isNaN(healthScore) ? "" : `${healthScore}\n${category}`;
              },
            },
          },
          rounded: true,
        },
      },
      colors: ["#96ACFA", "#0B5676", "#1FA6E0", "#CAE427"],
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
            value={filterDate}
            style={{ width: "150px", height: "40px" }} // Consistent width and height
          >
            <Option value="1d">Today</Option>
            <Option value="2d">Yesterday</Option>
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
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
              <Col span={12} lg={12} md={24}>
                <Row style={{border: '1px solid #F2F2F2', borderRadius: "12px", padding: '24px', textAlign: 'center', lineHeight: '25px'}}>
                  <Col span={8}>
                      <div
                        style={{
                          color: '#BBBBBB',
                          fontSize: '16px',
                          fontWeight: 600,
                        }}
                      >
                        Age
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: 700,
                        }}
                      >
                        {profileData?.user?.age || "N/A"}
                      </div>
                  </Col>
                  <Col span={8}>
                      <div
                         style={{
                          color: '#BBBBBB',
                          fontSize: '16px',
                          fontWeight: 600,
                        }}
                      >
                        Height
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: 700,
                        }}
                      >
                        {profileData?.user.height
                          ? cmToFeetInches(profileData?.user.height)
                          : "N/A"}
                      </div>
                  </Col>
                  <Col span={8}>
                      <div
                         style={{
                          color: '#BBBBBB',
                          fontSize: '16px',
                          fontWeight: 600,
                        }}
                      >
                        Weight
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: 700,
                        }}
                      >
                        {profileData?.user?.weight
                          ? profileData?.user?.weight + `${profileData?.user?.weight === 'en_US' ? ' lb' : ' kg'}` 
                          : "0"}
                      </div>
                  </Col>
                </Row>
                <Row style={{marginTop: '25px'}} gutter={[16, 16]}>
                  <Col span={12} >
                    <HealthMetric
                      icon={
                        <HeartFilled
                          style={{ color: "#8B5CF6", fontSize: '18px',
                            background: '#F2F2F2',
                            borderRadius: '8px',
                            padding: '6px' }}
                        />
                      }
                      title="Resting Heart Rate"
                      value={
                        healthData?.heartRate
                          ? `${healthData?.heartRate} bpm`
                          : "N/A"
                      }
                      subtext="Daily average"
                      status={
                        getHeartRateType(healthData?.age, healthData?.heartRate)
                          ?.type
                      }
                      statusColor={
                        getHeartRateType(healthData?.age, healthData?.heartRate)
                          ?.color
                      }
                      recommendation={
                        getHeartRateType(healthData?.age, healthData?.heartRate)
                          ?.recommended
                      }
                    />
                  </Col>
                  <Col span={12}>
                    <HealthMetric
                      icon={
                        <MoonFilled
                          style={{ color: "#3B82F6", fontSize: '18px',
                            background: '#F2F2F2',
                            borderRadius: '8px',
                            padding: '6px' }}
                        />
                      }
                      title="Sleep"
                      value={
                        healthData?.sleep
                          ? convertDecimalHours(healthData?.sleep)
                          : "N/A"
                      }
                      subtext="Last night"
                      status={
                        getSleepAnalysis(healthData?.age, healthData.sleep)
                          .status || ""
                      }
                      statusColor={
                        getSleepAnalysis(healthData?.age, healthData.sleep)
                          .color || ""
                      }
                      recommendation="Recommended (7-9h)"
                    />
                  </Col>
                  <Col span={12}>
                    <HealthMetric
                      icon={
                        <img
                          src={icon1}
                          alt="icon"
                          style={{
                            color: "#10B981",
                            fontSize: '18px',
                            background: '#F2F2F2',
                            borderRadius: '8px',
                            padding: '4px 8p'
                          }}
                        />
                      }
                      title="Steps"
                      value={healthData?.steps || "N/A"}
                      subtext="Daily average"
                      status={getStepActivityLevel(healthData?.steps)?.type}
                      statusColor={
                        getStepActivityLevel(healthData?.steps)?.color
                      }
                      recommendation={
                        "Recommended " +
                        getStepActivityLevel(healthData?.steps)?.recommended
                      }
                    />
                  </Col>

                  <Col span={12}>
                    <HealthMetric
                      icon={
                        <img
                          src={icon2}
                          alt="icon"
                          style={{
                            color: "#10B981",
                            fontSize: '18px',
                            background: '#F2F2F2',
                            borderRadius: '8px',
                            padding: '4px 8px',
                          }}
                        />
                      }
                      title="BMI"
                      value={healthData?.bmi ? healthData?.bmi : "N/A"}
                      subtext="Last 7 Days"
                      status={getWeightStatus(healthData?.bmi).status || ""}
                      statusColor={getWeightStatus(healthData?.bmi).color || ""}
                      recommendation={
                        getWeightStatus(healthData?.bmi)?.range || ""
                      }
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={12} md={12} sm={24}>
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Chart
                    options={chartOptions.options}
                    series={chartOptions.series}
                    type="radialBar"
                    width={600}
                    height={600}
                  />
                </div>
              </Col>
            </Row>
          ) : (
            <Col
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80%",
              }}
            >
              <p style={{ fontSize: "20px" }}>
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
