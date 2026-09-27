// Campus zones configuration with coordinate mappings for heatmap and adjacency lists for smart matching

const CAMPUS_ZONES = [
  { id: 'library', name: 'Central Library', building: 'Academic Block A', x: 25, y: 30, adj: ['canteen', 'auditorium', 'lab_block'] },
  { id: 'canteen', name: 'Student Canteen & Food Court', building: 'Student Union', x: 45, y: 40, adj: ['library', 'sports_complex', 'admin_block'] },
  { id: 'lab_block', name: 'Engineering Labs (1-5)', building: 'Tech Tower', x: 20, y: 65, adj: ['library', 'science_block', 'canteen'] },
  { id: 'sports_complex', name: 'Sports Complex & Gym', building: 'Recreation Center', x: 70, y: 35, adj: ['canteen', 'hostel_quad'] },
  { id: 'auditorium', name: 'Main Auditorium', building: 'Central Block', x: 35, y: 20, adj: ['library', 'admin_block'] },
  { id: 'admin_block', name: 'Admin & Registrar Office', building: 'Admin Building', x: 55, y: 20, adj: ['auditorium', 'canteen'] },
  { id: 'science_block', name: 'Science Block & Lecture Halls', building: 'Block C', x: 40, y: 75, adj: ['lab_block', 'canteen'] },
  { id: 'hostel_quad', name: 'Hostel Quadrangle & Lawn', building: 'Residential Zone', x: 80, y: 60, adj: ['sports_complex', 'canteen'] }
];

module.exports = {
  CAMPUS_ZONES,
  getZoneById: (id) => CAMPUS_ZONES.find(z => z.id === id || z.name.toLowerCase() === id.toLowerCase()),
  areZonesAdjacent: (zone1Id, zone2Id) => {
    if (zone1Id === zone2Id) return true;
    const z1 = CAMPUS_ZONES.find(z => z.id === zone1Id);
    return z1 && z1.adj.includes(zone2Id);
  }
};
