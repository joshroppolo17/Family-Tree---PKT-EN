// script.js
async function loadData() {
  const res = await fetch('data/relations.json');
  if (!res.ok) throw new Error('Failed to load data');
  return res.json();
}

function buildNetwork(container, members, relations) {
  // nodes: id + label; color by class-year grouping (simple)
  const nodes = members.map(m => ({
    id: m.id,
    label: m.name,
    title: `${m.name}\n${m.nick ? m.nick : ''}\n${m.class}\n${m.bio ? m.bio : ''}`,
    shape: 'box',
    font: { multi: true, face: 'Inter, Roboto, system-ui' }
  }));

  const edges = relations.map(r => ({
    from: r.from,
    to: r.to,
    arrows: 'to',
    smooth: { type: 'cubicBezier' }
  }));

  const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };

  const options = {
    nodes: {
      borderWidth: 1,
      shapeProperties: { borderRadius: 6 },
      margin: 8
    },
    physics: {
      stabilization: true,
      barnesHut: {
        gravitationalConstant: -2000,
        springConstant: 0.05
      }
    },
    interaction: {
      hover: true,
      navigationButtons: true,
      keyboard: true
    },
    edges: {
      color: { inherit: true },
      smooth: true
    }
  };

  const network = new vis.Network(container, data, options);

  // node click shows details in the aside area
  network.on('click', function (params) {
    if (!params.nodes || !params.nodes.length) return;
    const id = params.nodes[0];
    const member = members.find(m => m.id === id);
    const details = document.getElementById('details');
    details.innerHTML = `
      <h3>${member.name}</h3>
      <p><b>Nickname:</b> ${member.nick || '—'}</p>
      <p><b>Class:</b> ${member.class || '—'}</p>
      <p>${member.bio || ''}</p>
      <p><small>ID: ${member.id}</small></p>
    `;
  });

  // fit view
  network.once('stabilizationIterationsDone', function () {
    network.fit();
  });

  return network;
}

(async () => {
  try {
    const data = await loadData();
    const container = document.getElementById('network');
    buildNetwork(container, data.members, data.relations);
  } catch (err) {
    console.error(err);
    document.getElementById('network').innerText = 'Failed to load data — check console.';
  }
})();
