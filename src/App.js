import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [corpCode, setCorpCode] = useState('');
  const [bsnsYear, setBsnsYear] = useState(new Date().getFullYear().toString());
  const [reprtCode, setReprtCode] = useState('11011');
  const [isLoading, setIsLoading] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [error, setError] = useState(null);
  const [reportCodes, setReportCodes] = useState([]);
  const [apiKeyStatus, setApiKeyStatus] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  // 서버 상태 및 API 키 확인
  useEffect(() => {
    checkServerHealth();
    fetchReportCodes();
  }, []);

  const checkServerHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log('서버 상태:', response.data);
      
      const apiKeyResponse = await axios.get(`${API_BASE_URL}/check-api-key`);
      setApiKeyStatus(apiKeyResponse.data);
    } catch (error) {
      console.error('서버 연결 실패:', error);
      setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
  };

  // 보고서 코드 목록 가져오기
  const fetchReportCodes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/report-codes`);
      setReportCodes(response.data.data);
    } catch (error) {
      console.error('보고서 코드 조회 오류:', error);
    }
  };

  // 재무정보 조회
  const fetchFinancialData = async () => {
    if (!corpCode || !bsnsYear || !reprtCode) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFinancialData(null);
    
    try {
      console.log('재무정보 요청:', { corpCode, bsnsYear, reprtCode });

      const response = await axios.post(`${API_BASE_URL}/financial-data`, {
        corp_code: corpCode,
        bsns_year: bsnsYear,
        reprt_code: reprtCode
      });

      if (response.data.success) {
        setFinancialData(response.data);
        console.log('재무정보 로드 완료');
      } else {
        setError('데이터를 가져오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      setError(error.response?.data?.error || '서버에서 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 분석 시작
  const handleAnalyze = () => {
    fetchFinancialData();
  };

  // 입력 필드 초기화
  const handleReset = () => {
    setCorpCode('');
    setBsnsYear(new Date().getFullYear().toString());
    setReprtCode('11011');
    setFinancialData(null);
    setError(null);
  };

  return (
    <div className="one-ui-app">
      {/* Header with Navigation */}
      <header className="one-ui-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">OpenDART 재무정보 분석기</h1>
          </div>
          
          {/* Main Navigation */}
          <nav className="main-nav">
            <div className="nav-item active">
              <span className="nav-icon">📊</span>
              <span>재무분석</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">📈</span>
              <span>차트</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">🏢</span>
              <span>기업정보</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span>설정</span>
            </div>
          </nav>
          
          <div className="header-actions">
            <button className="icon-button" onClick={handleReset} title="초기화">
              <span className="material-icons">refresh</span>
            </button>
            <button className="icon-button" title="데이터 내보내기">
              <span className="material-icons">download</span>
            </button>
            <button className="icon-button" title="설정">
              <span className="material-icons">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="one-ui-main">
        <div className="content-grid">
          {/* Left Sidebar - Input Form */}
          <aside className="sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">재무정보 조회 조건</h3>
              
              {/* 기업코드 입력 */}
              <div className="input-group">
                <label className="input-label">기업코드 (corp_code)</label>
                <input
                  type="text"
                  value={corpCode}
                  onChange={(e) => setCorpCode(e.target.value)}
                  placeholder="예: 00126380"
                  className="text-input"
                />
                <small className="input-help">OpenDART 기업고유번호를 입력하세요</small>
              </div>

              {/* 사업연도 입력 */}
              <div className="input-group">
                <label className="input-label">사업연도 (bsns_year)</label>
                <input
                  type="number"
                  value={bsnsYear}
                  onChange={(e) => setBsnsYear(e.target.value)}
                  placeholder="예: 2023"
                  className="text-input"
                  min="2010"
                  max={new Date().getFullYear()}
                />
                <small className="input-help">조회할 사업연도를 입력하세요</small>
              </div>

              {/* 보고서 코드 선택 */}
              <div className="input-group">
                <label className="input-label">보고서 코드 (reprt_code)</label>
                <select
                  value={reprtCode}
                  onChange={(e) => setReprtCode(e.target.value)}
                  className="select-input"
                >
                  {reportCodes.map(report => (
                    <option key={report.code} value={report.code}>
                      {report.code} - {report.name}
                    </option>
                  ))}
                </select>
                <small className="input-help">조회할 보고서 유형을 선택하세요</small>
              </div>

              {/* API 키 상태 */}
              {apiKeyStatus && (
                <div className="api-status">
                  <div className={`status-indicator ${apiKeyStatus.hasApiKey ? 'success' : 'error'}`}>
                    {apiKeyStatus.hasApiKey ? '✅' : '❌'}
                  </div>
                  <span className="status-text">{apiKeyStatus.message}</span>
                </div>
              )}

              {/* 조회 버튼 */}
              <button 
                className="analyze-button"
                onClick={handleAnalyze}
                disabled={isLoading || !corpCode || !bsnsYear || !reprtCode}
              >
                {isLoading ? '조회 중...' : '재무정보 조회'}
              </button>
            </div>

            {/* 사용법 안내 */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">사용법 안내</h3>
              <div className="help-content">
                <div className="help-item">
                  <strong>기업코드:</strong> OpenDART에서 제공하는 기업고유번호
                </div>
                <div className="help-item">
                  <strong>사업연도:</strong> 조회할 재무제표의 사업연도
                </div>
                <div className="help-item">
                  <strong>보고서:</strong> 사업보고서, 분기보고서 등
                </div>
                <div className="help-item">
                  <strong>API 키:</strong> {apiKeyStatus?.hasApiKey ? '설정됨' : '설정 필요'}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="main-content">
            {/* Welcome Section */}
            <div className="welcome-section">
              <h2>OpenDART 재무정보 분석 📊</h2>
              <p>금융감독원 OpenDART API를 통해 기업의 정기보고서 재무정보를 조회합니다</p>
              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="loading-section">
                <div className="loading-spinner"></div>
                <p>OpenDART API에서 재무정보를 조회 중입니다...</p>
              </div>
            )}

            {/* Financial Data Display */}
            {!isLoading && financialData && (
              <div className="card financial-data">
                <div className="table-header">
                  <h2 className="card-title">재무정보 조회 결과</h2>
                  <div className="table-actions">
                    <button className="table-button">JSON 보기</button>
                    <button className="table-button">내보내기</button>
                  </div>
                </div>
                
                <div className="data-info">
                  <div className="info-item">
                    <span className="info-label">기업코드:</span>
                    <span className="info-value">{financialData.params.corp_code}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">사업연도:</span>
                    <span className="info-value">{financialData.params.bsns_year}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">보고서:</span>
                    <span className="info-value">{financialData.params.reprt_code}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">조회시간:</span>
                    <span className="info-value">{new Date(financialData.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="data-content">
                  <h3>API 응답 데이터</h3>
                  <div className="xml-content">
                    <pre>{JSON.stringify(financialData.data, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* No Data State */}
            {!isLoading && !financialData && !error && (
              <div className="card no-data">
                <h2 className="card-title">데이터 없음</h2>
                <p>재무정보를 조회하려면 왼쪽에서 조건을 입력하고 "재무정보 조회" 버튼을 클릭하세요.</p>
                <div className="example-data">
                  <h4>예시 데이터:</h4>
                  <ul>
                    <li>기업코드: 00126380 (삼성전자)</li>
                    <li>사업연도: 2023</li>
                    <li>보고서: 11011 (사업보고서)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
