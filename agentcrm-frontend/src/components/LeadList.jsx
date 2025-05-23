import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function LeadList() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    api.get('/leads')
      .then(res => setLeads(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>📋 לידים</h2>
      {leads.length === 0 ? (
        <p>אין לידים עדיין.</p>
      ) : (
        <ul>
          {leads.map(lead => (
            <li key={lead.id}>
              <strong>{lead.title}</strong> ({lead.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
