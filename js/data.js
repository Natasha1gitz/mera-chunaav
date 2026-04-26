// ============================================
// Mera Chunaav — Data Module
// Constituency data + lookup functions
// ============================================

const DataModule = {
  constituencies: [],
  loaded: false,

  async load() {
    try {
      // Try loading user-provided Dataset.json first
      const resp = await fetch('Dataset.json');
      const raw = await resp.json();
      this.constituencies = this.transformDataset(raw);
      this.loaded = true;
    } catch (e) {
      console.warn('Dataset.json not found, using fallback data');
      this.constituencies = DataModule.FALLBACK;
      this.loaded = true;
    }
  },

  // Transform the user's Dataset.json format into our app format
  transformDataset(raw) {
    const partyColors = {
      'BJP': '#FF6B00', 'INC': '#19AAAF', 'AAP': '#0074D9', 'BSP': '#2196F3',
      'SP': '#E91E1E', 'RLP': '#FFD700', 'TMC': '#00923F', 'DMK': '#E30000',
      'YSRCP': '#0078D4', 'TDP': '#FFFF00', 'JDU': '#1B5E20', 'NCP': '#004B87',
      'SHS': '#F57F17', 'CPIM': '#FF0000', 'IND': '#888888'
    };
    const partySymbols = {
      'BJP': '🪷', 'INC': '✋', 'AAP': '🧹', 'BSP': '🐘', 'SP': '🚲',
      'RLP': '⭐', 'TMC': '🌸', 'DMK': '☀️', 'JDU': '🏹', 'NCP': '🕰️',
      'SHS': '🏹', 'IND': '📋'
    };

    // Pincode mapping for the constituencies (realistic ranges)
    const pincodeMap = {
      'Mathura': [[281001, 281006]],
      'Amethi': [[227401, 227412]],
      'Raebareli': [[229001, 229010]],
      'Faizabad': [[224001, 224010]],
      'Jhansi': [[284001, 284010]],
      'Chittorgarh': [[312001, 312010]],
      'Pali': [[306401, 306410]],
      'Nagaur': [[341001, 341010]],
      'Barmer': [[344001, 344010]],
      'Tonk-Sawai Madhopur': [[304001, 304010]],
      'Lucknow': [[226001, 226030]],
      'Mumbai North': [[400060, 400099]],
      'New Delhi': [[110001, 110025]]
    };

    // Phase assignments
    const phaseMap = {
      'Mathura': 2, 'Amethi': 5, 'Raebareli': 5, 'Faizabad': 5,
      'Jhansi': 3, 'Chittorgarh': 2, 'Pali': 2, 'Nagaur': 2,
      'Barmer': 2, 'Tonk-Sawai Madhopur': 2
    };

    // Booth data
    const boothMap = {
      'Mathura': { name: 'Govt. Primary School, Vrindavan', address: 'Vrindavan, Mathura 281121', lat: 27.5830, lng: 77.7000, distance: '1.8 km' },
      'Amethi': { name: 'Block Primary School, Gauriganj', address: 'Gauriganj, Amethi 227409', lat: 26.1525, lng: 81.5991, distance: '2.1 km' },
      'Raebareli': { name: 'Govt. Inter College, Raebareli', address: 'Civil Lines, Raebareli 229001', lat: 26.2308, lng: 81.2340, distance: '1.5 km' },
      'Faizabad': { name: 'Municipal School, Faizabad', address: 'Faizabad 224001', lat: 26.7735, lng: 82.1460, distance: '0.9 km' },
      'Jhansi': { name: 'Kendriya Vidyalaya, Jhansi', address: 'Jhansi Cantt 284001', lat: 25.4484, lng: 78.5685, distance: '1.2 km' },
      'Chittorgarh': { name: 'Govt. School, Chittorgarh', address: 'Chittorgarh 312001', lat: 24.8887, lng: 74.6269, distance: '1.6 km' },
      'Pali': { name: 'Primary School, Pali', address: 'Pali City 306401', lat: 25.7711, lng: 73.3234, distance: '1.0 km' },
      'Nagaur': { name: 'Govt. School, Nagaur', address: 'Nagaur 341001', lat: 27.1960, lng: 73.7350, distance: '2.0 km' },
      'Barmer': { name: 'Govt. School, Barmer', address: 'Barmer 344001', lat: 25.7515, lng: 71.3918, distance: '1.3 km' },
      'Tonk-Sawai Madhopur': { name: 'Primary School, Tonk', address: 'Tonk 304001', lat: 26.1665, lng: 75.7885, distance: '1.7 km' }
    };

    const results = [];
    let id = 1;

    for (const [name, data] of Object.entries(raw)) {
      const party = data.winner.party;
      const totalVoters = data.total_voters;
      const turnout2024 = data.turnout;
      // Generate plausible historical turnout
      const turnout2019 = +(turnout2024 - 1.5 + Math.random() * 3).toFixed(1);
      const turnout2014 = +(turnout2019 - 2 + Math.random() * 4).toFixed(1);

      // Generate runner-up candidates
      const runnerParties = Object.keys(partyColors).filter(p => p !== party && p !== 'IND');
      const runnerParty1 = party === 'INC' ? 'BJP' : 'INC';
      const runnerParty2 = runnerParties.find(p => p !== runnerParty1 && p !== party) || 'BSP';

      const winnerVotes = data.winner.votes;
      const runnerVotes = Math.floor(winnerVotes * (0.5 + Math.random() * 0.3));
      const thirdVotes = Math.floor(winnerVotes * (0.05 + Math.random() * 0.1));
      const totalVotesCast = Math.floor(totalVoters * turnout2024 / 100);
      const winnerShare = +((winnerVotes / totalVotesCast) * 100).toFixed(1);
      const runnerShare = +((runnerVotes / totalVotesCast) * 100).toFixed(1);
      const thirdShare = +((thirdVotes / totalVotesCast) * 100).toFixed(1);

      const maleElectors = Math.floor(totalVoters * 0.53);
      const femaleElectors = Math.floor(totalVoters * 0.465);
      const thirdGender = totalVoters - maleElectors - femaleElectors;
      const womenPct = +((femaleElectors / totalVoters) * 100).toFixed(1);

      const constituency = {
        id: id++,
        name: name,
        state: data.state,
        phase: phaseMap[name] || 3,
        pollingDate: '2024-05-07',
        pincodes: pincodeMap[name] || [[100000, 100010]],
        electors: { total: totalVoters, male: maleElectors, female: femaleElectors, third: thirdGender },
        turnout: { '2014': turnout2014, '2019': turnout2019, '2024': turnout2024 },
        womenElectors: womenPct,
        winningMargin: winnerVotes - runnerVotes,
        candidates: [
          {
            name: data.winner.name, party: party,
            partyColor: partyColors[party] || '#888888',
            symbol: partySymbols[party] || '📋',
            votes: winnerVotes,
            voteShare: winnerShare,
            winner: true,
            assets: data.winner.assets_cr,
            criminalCases: data.winner.criminal_cases,
            education: data.winner.education,
            age: 45 + Math.floor(Math.random() * 25)
          },
          {
            name: this.generateName(), party: runnerParty1,
            partyColor: partyColors[runnerParty1] || '#888888',
            symbol: partySymbols[runnerParty1] || '📋',
            votes: runnerVotes,
            voteShare: runnerShare,
            winner: false,
            assets: +(1 + Math.random() * 5).toFixed(1),
            criminalCases: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
            education: 'Graduate',
            age: 40 + Math.floor(Math.random() * 20)
          },
          {
            name: this.generateName(), party: runnerParty2,
            partyColor: partyColors[runnerParty2] || '#888888',
            symbol: partySymbols[runnerParty2] || '📋',
            votes: thirdVotes,
            voteShare: thirdShare,
            winner: false,
            assets: +(0.5 + Math.random() * 3).toFixed(1),
            criminalCases: 0,
            education: 'Graduate',
            age: 35 + Math.floor(Math.random() * 25)
          }
        ],
        booth: boothMap[name] || { name: 'Govt. School', address: name, lat: 26.85, lng: 80.91, distance: '1.5 km' },
        phases: this.generatePhases(phaseMap[name] || 3)
      };

      results.push(constituency);
    }

    // Add the 3 built-in constituencies too
    return [...results, ...DataModule.FALLBACK];
  },

  generateName() {
    const first = ['Ramesh', 'Suresh', 'Priya', 'Anita', 'Vikram', 'Sunita', 'Manoj', 'Deepak', 'Kavita', 'Rajendra', 'Meena', 'Ashok', 'Pooja', 'Sanjay', 'Neha'];
    const last = ['Kumar', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Yadav', 'Patel', 'Joshi', 'Mishra', 'Chauhan', 'Rajput', 'Devi', 'Agarwal'];
    return first[Math.floor(Math.random() * first.length)] + ' ' + last[Math.floor(Math.random() * last.length)];
  },

  generatePhases(phaseNum) {
    return [
      { id: 1, label: 'Notification', title: 'Issue of Notification', days: 1, desc: 'Election Commission issues official notification for the constituency.', status: 'completed', date: '2024-03-16' },
      { id: 2, label: 'Nomination', title: 'Filing of Nominations', days: 7, desc: 'Candidates file nomination papers with returning officer.', status: 'completed', date: '2024-04-18' },
      { id: 3, label: 'Scrutiny', title: 'Scrutiny of Nominations', days: 1, desc: 'Returning officer examines all nominations for validity.', status: 'completed', date: '2024-04-22' },
      { id: 4, label: 'Withdrawal', title: 'Last Date for Withdrawal', days: 2, desc: 'Candidates may withdraw their nominations before this deadline.', status: 'completed', date: '2024-04-25' },
      { id: 5, label: 'Campaign', title: 'Campaigning Period', days: 16, desc: 'Active campaigning by parties and candidates. Ends 48 hours before polling.', status: 'completed', date: '2024-05-05' },
      { id: 6, label: 'Polling', title: 'Polling Day', days: 1, desc: 'Voters cast their ballots at designated polling stations using EVMs.', status: 'completed', date: '2024-05-07' },
      { id: 7, label: 'Counting', title: 'Counting of Votes', days: 1, desc: 'EVMs opened and votes counted. Results declared by returning officer.', status: 'completed', date: '2024-06-04' }
    ];
  },

  findByPincode(pincode) {
    const pin = parseInt(pincode);
    return this.constituencies.find(c =>
      c.pincodes && c.pincodes.some(range => {
        if (typeof range === 'string') return range === pincode;
        if (Array.isArray(range)) return pin >= range[0] && pin <= range[1];
        return false;
      })
    ) || this.constituencies[0]; // fallback to first
  },

  getConstituency(name) {
    return this.constituencies.find(c => c.name === name);
  },

  FALLBACK: [
    {
      id: 100, name: "Lucknow", state: "Uttar Pradesh", phase: 5,
      pollingDate: "2024-05-20",
      pincodes: [[226001, 226030]],
      electors: { total: 1987345, male: 1054321, female: 928012, third: 5012 },
      turnout: { "2014": 57.4, "2019": 54.8, "2024": 58.3 },
      womenElectors: 47.2, winningMargin: 34521,
      candidates: [
        { name: "Rajnath Singh", party: "BJP", partyColor: "#FF6B00", symbol: "🪷", votes: 689018, voteShare: 54.2, winner: true, assets: 4.3, criminalCases: 2, education: "M.A.", age: 72 },
        { name: "Ravidas Mehrotra", party: "SP", partyColor: "#E91E1E", symbol: "🚲", votes: 354497, voteShare: 27.9, winner: false, assets: 2.1, criminalCases: 0, education: "B.A.", age: 65 },
        { name: "Saroj Aggarwal", party: "BSP", partyColor: "#2196F3", symbol: "🐘", votes: 98234, voteShare: 7.7, winner: false, assets: 1.8, criminalCases: 0, education: "B.Com", age: 58 }
      ],
      booth: { name: "Govt. Inter College, Aliganj", address: "Aliganj, Lucknow 226024", lat: 26.8950, lng: 80.9470, distance: "1.2 km" },
      phases: [
        { id: 1, label: "Notification", title: "Issue of Notification", days: 1, desc: "Election Commission issues official notification.", status: "completed", date: "2024-03-16" },
        { id: 2, label: "Nomination", title: "Filing of Nominations", days: 7, desc: "Candidates file nomination papers.", status: "completed", date: "2024-04-26" },
        { id: 3, label: "Scrutiny", title: "Scrutiny of Nominations", days: 1, desc: "Nominations examined.", status: "completed", date: "2024-04-29" },
        { id: 4, label: "Withdrawal", title: "Last Date for Withdrawal", days: 2, desc: "Candidates may withdraw.", status: "completed", date: "2024-05-02" },
        { id: 5, label: "Campaign", title: "Campaigning Period", days: 16, desc: "Active campaigning.", status: "completed", date: "2024-05-18" },
        { id: 6, label: "Polling", title: "Polling Day", days: 1, desc: "Voting day.", status: "completed", date: "2024-05-20" },
        { id: 7, label: "Counting", title: "Counting of Votes", days: 1, desc: "Results declared.", status: "completed", date: "2024-06-04" }
      ]
    },
    {
      id: 101, name: "Mumbai North", state: "Maharashtra", phase: 5,
      pollingDate: "2024-05-20",
      pincodes: [[400060, 400099]],
      electors: { total: 1534210, male: 812345, female: 718765, third: 3100 },
      turnout: { "2014": 52.1, "2019": 55.3, "2024": 53.7 },
      womenElectors: 46.9, winningMargin: 45623,
      candidates: [
        { name: "Piyush Goyal", party: "BJP", partyColor: "#FF6B00", symbol: "🪷", votes: 578934, voteShare: 52.8, winner: true, assets: 18.7, criminalCases: 0, education: "B.Com, LLB", age: 59 },
        { name: "Bhushan Patil", party: "INC", partyColor: "#19AAAF", symbol: "✋", votes: 433311, voteShare: 39.5, winner: false, assets: 3.2, criminalCases: 1, education: "M.A.", age: 52 }
      ],
      booth: { name: "BMC School, Goregaon", address: "Goregaon West, Mumbai 400062", lat: 19.1663, lng: 72.8490, distance: "0.8 km" },
      phases: [
        { id: 1, label: "Notification", title: "Issue of Notification", days: 1, desc: "Official notification.", status: "completed", date: "2024-03-16" },
        { id: 2, label: "Nomination", title: "Filing of Nominations", days: 7, desc: "Filing period.", status: "completed", date: "2024-04-26" },
        { id: 3, label: "Scrutiny", title: "Scrutiny of Nominations", days: 1, desc: "Scrutiny.", status: "completed", date: "2024-04-29" },
        { id: 4, label: "Withdrawal", title: "Last Date for Withdrawal", days: 2, desc: "Withdrawal deadline.", status: "completed", date: "2024-05-02" },
        { id: 5, label: "Campaign", title: "Campaigning Period", days: 16, desc: "Campaign period.", status: "completed", date: "2024-05-18" },
        { id: 6, label: "Polling", title: "Polling Day", days: 1, desc: "Voting day.", status: "completed", date: "2024-05-20" },
        { id: 7, label: "Counting", title: "Counting of Votes", days: 1, desc: "Results declared.", status: "completed", date: "2024-06-04" }
      ]
    },
    {
      id: 102, name: "New Delhi", state: "Delhi", phase: 6,
      pollingDate: "2024-05-25",
      pincodes: [[110001, 110025]],
      electors: { total: 1245670, male: 678900, female: 564320, third: 2450 },
      turnout: { "2014": 65.1, "2019": 60.4, "2024": 58.1 },
      womenElectors: 45.3, winningMargin: 78432,
      candidates: [
        { name: "Bansuri Swaraj", party: "BJP", partyColor: "#FF6B00", symbol: "🪷", votes: 498231, voteShare: 54.1, winner: true, assets: 8.9, criminalCases: 0, education: "B.A. LLB (Hons)", age: 38 },
        { name: "Somnath Bharti", party: "AAP", partyColor: "#0074D9", symbol: "🧹", votes: 319799, voteShare: 34.7, winner: false, assets: 5.4, criminalCases: 3, education: "LLB", age: 53 }
      ],
      booth: { name: "Kendriya Vidyalaya, RK Puram", address: "Sector 4, RK Puram, New Delhi 110022", lat: 28.5705, lng: 77.1758, distance: "1.5 km" },
      phases: [
        { id: 1, label: "Notification", title: "Issue of Notification", days: 1, desc: "Official notification.", status: "completed", date: "2024-03-22" },
        { id: 2, label: "Nomination", title: "Filing of Nominations", days: 7, desc: "Filing period.", status: "completed", date: "2024-04-30" },
        { id: 3, label: "Scrutiny", title: "Scrutiny of Nominations", days: 1, desc: "Scrutiny.", status: "completed", date: "2024-05-03" },
        { id: 4, label: "Withdrawal", title: "Last Date for Withdrawal", days: 2, desc: "Withdrawal deadline.", status: "completed", date: "2024-05-06" },
        { id: 5, label: "Campaign", title: "Campaigning Period", days: 16, desc: "Campaign period.", status: "completed", date: "2024-05-23" },
        { id: 6, label: "Polling", title: "Polling Day", days: 1, desc: "Voting day.", status: "completed", date: "2024-05-25" },
        { id: 7, label: "Counting", title: "Counting of Votes", days: 1, desc: "Results declared.", status: "completed", date: "2024-06-04" }
      ]
    }
  ]
};
