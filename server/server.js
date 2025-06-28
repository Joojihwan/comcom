const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

// OpenDART API 설정
const OPENDART_API_KEY = '6c61be9911df7e378611ae7c07ad459b21fcaf22';
const OPENDART_BASE_URL = 'https://opendart.fss.or.kr/api';

app.use(cors());
app.use(express.json());

// OpenDART API 호출 함수
async function callOpenDARTAPI(params) {
  try {
    const response = await axios.get(`${OPENDART_BASE_URL}/fnlttSinglAcnt.xml`, {
      params: {
        crtfc_key: OPENDART_API_KEY,
        ...params
      },
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    console.error('OpenDART API 호출 오류:', error.response?.data || error.message);
    throw error;
  }
}

// 기업 목록 조회 API (OpenDART 기업코드 목록)
app.get('/api/companies', async (req, res) => {
  try {
    // OpenDART 기업코드 목록 API 호출
    const response = await axios.get(`${OPENDART_BASE_URL}/corpCode.xml`, {
      params: {
        crtfc_key: OPENDART_API_KEY
      }
    });
    
    res.json({
      success: true,
      data: response.data,
      message: '기업 목록을 성공적으로 가져왔습니다.'
    });
  } catch (error) {
    console.error('기업 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '기업 목록을 가져오는 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 정기보고서 재무정보 조회 API
app.post('/api/financial-data', async (req, res) => {
  try {
    const { corp_code, bsns_year, reprt_code } = req.body;
    
    // 필수 파라미터 검증
    if (!corp_code || !bsns_year || !reprt_code) {
      return res.status(400).json({
        success: false,
        error: '필수 파라미터가 누락되었습니다. (corp_code, bsns_year, reprt_code)'
      });
    }
    
    console.log('재무정보 요청:', { corp_code, bsns_year, reprt_code });
    
    // OpenDART API 호출
    const financialData = await callOpenDARTAPI({
      corp_code,
      bsns_year,
      reprt_code
    });
    
    res.json({
      success: true,
      data: financialData,
      params: { corp_code, bsns_year, reprt_code },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('재무정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '재무정보를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 보고서 코드 목록 API
app.get('/api/report-codes', (req, res) => {
  const reportCodes = [
    { code: '11011', name: '사업보고서' },
    { code: '11014', name: '1분기보고서' },
    { code: '11013', name: '반기보고서' },
    { code: '11012', name: '3분기보고서' },
    { code: '11015', name: '분기보고서' }
  ];
  
  res.json({
    success: true,
    data: reportCodes
  });
});

// 서버 상태 확인 API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'OpenDART 재무정보 API 서버가 정상적으로 작동 중입니다.',
    timestamp: new Date().toISOString(),
    apiKey: OPENDART_API_KEY ? '설정됨' : '설정되지 않음'
  });
});

// API 키 확인 API
app.get('/api/check-api-key', (req, res) => {
  res.json({
    success: true,
    hasApiKey: !!OPENDART_API_KEY,
    message: OPENDART_API_KEY ? 'API 키가 설정되어 있습니다.' : 'API 키가 설정되지 않았습니다.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 OpenDART 재무정보 API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📊 OpenDART API 서버`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`🔑 API 키: ${OPENDART_API_KEY ? '설정됨' : '설정되지 않음'}`);
  console.log(`📋 사용 가능한 엔드포인트:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/companies`);
  console.log(`   - GET  /api/report-codes`);
  console.log(`   - POST /api/financial-data`);
});

module.exports = app; 