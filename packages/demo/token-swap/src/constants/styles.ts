import { COLORS, PAGE } from './colors';
interface IStyles {
  [key: string]: any;
}
export const basicLayout: IStyles = {
  width: 'calc(100% - 7rem)',
  minHeight: 'calc(100vh - 4rem)',
  padding: '3.5rem 3rem',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: PAGE.user.bg,
};
export const title: IStyles = {
  color: COLORS.black,
  width: '100%',
  padding: '0 0 2rem 0',
  fontSize: '2rem',
  fontWeight: 700,
  textAlign: 'center',
};
export const titleWithBackBtn: IStyles = {
  color: COLORS.black,
  width: '100%',
  padding: '0 0 2rem 0',
  fontSize: '2rem',
  fontWeight: 700,
  display: 'grid',
  gridTemplateColumns: '1fr 3fr 1fr',
};
export const pageContainer: IStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
};
export const box: IStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  background: '#FFFFFF',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  borderRadius: 10,
};
