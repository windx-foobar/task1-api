export async function ok(req, res) {
  return res.status(200).json({ message: 'test ok' });
}

export async function item(req, res) {
  return res.status(200).json({ message: 'test item', data: {} });
}

export async function list(req, res) {
  return res.status(200).json({ message: 'test list', items: [] });
}
