export default function $(path) {
  return (fetch(`https://${window.config.server}/${path}`).then((rs) => rs.json()));
}
