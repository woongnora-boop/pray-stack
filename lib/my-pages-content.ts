import packageJson from '@/package.json';

export const MY_APP_NAME = 'pray-stack';
export const MY_CONTACT_EMAIL = 'woongnora@gmail.com';
export const MY_CONTACT_MAILTO = `mailto:${MY_CONTACT_EMAIL}`;

export function getMyAppVersion(): string {
  const v = (packageJson as { version?: string }).version;
  return typeof v === 'string' && v.trim().length > 0 ? v : '개발 버전 (package.json version 미기입)';
}

export const MY_RECENT_UPDATE = '최근 업데이트 정보 준비 중';
export const MY_RECENT_UPDATE_REASON = '릴리스 노트 체계화 전 임시 문구입니다.';

export type MySection = {
  heading: string;
  intro?: string;
  items?: string[];
};

export type MyContent = {
  title: string;
  description: string;
  summary: string;
  paragraphs?: string[];
  sections?: MySection[];
  footerNote?: string;
};

export const MY_PAGE_CONTENT: Record<'about' | 'background' | 'privacy' | 'terms' | 'contact', MyContent> = {
  about: {
    title: '앱 소개',
    description: 'pray-stack이 어떤 앱인지 소개합니다.',
    summary: 'pray-stack은 말씀과 하루를 함께 기록하기 위한 크리스천 노트 앱입니다.',
    paragraphs: [
      '묵상은 마음의 기록으로, 만나는 오늘의 레마로, 감사는 작은 은혜들로 남길 수 있습니다.',
      'pray-stack은 많은 사용자에게 익숙한 성경 표현과 묵상 흐름을 고려해 개역한글 본문을 기준으로 정리했습니다. 익숙한 말씀의 어조가 기록과 묵상에 더 자연스럽게 이어지길 바라는 마음도 함께 담았습니다.',
      '이 앱은 기록을 많이 남기기 위한 도구라기보다, 하루의 말씀과 마음을 조용히 돌아보도록 돕는 공간을 지향합니다.',
      '바쁘게 지나가는 하루 속에서도 말씀, 생각, 감사가 흩어지지 않도록 작고 꾸준한 기록 습관을 만드는 것이 이 앱의 목적입니다.',
    ],
  },
  background: {
    title: '개발 배경',
    description: 'pray-stack을 왜 만들게 되었는지 전합니다.',
    summary: '좋았던 말씀, 짧은 묵상, 감사 제목이 금방 흘러가지 않도록 붙잡고 싶었습니다.',
    paragraphs: [
      '신앙생활을 하다 보면 좋았던 말씀, 짧은 묵상, 감사 제목이 금방 흘러가 버릴 때가 많았습니다.',
      'pray-stack은 "그날 받은 은혜를 부담 없이, 그러나 꾸준히 남길 수 있으면 좋겠다"는 생각에서 시작했습니다.',
      '거창한 기능보다 매일 다시 열어보고 싶은 구조, 복잡하지 않고 편안한 기록 경험, 그리고 말씀 중심의 흐름을 더 중요하게 생각하며 만들고 있습니다.',
      '아직 완성형이라기보다 계속 다듬고 자라나는 앱입니다. 사용자의 기록 경험이 더 편안해질 수 있도록 조금씩 개선해 나가고 있습니다.',
    ],
  },
  privacy: {
    title: '개인정보 처리방침',
    description: '사용자의 정보가 어떻게 다뤄지는지 안내합니다.',
    summary: 'pray-stack은 기록 저장과 서비스 운영에 필요한 최소한의 정보만 사용하려고 노력합니다.',
    sections: [
      {
        heading: '어떤 정보를 수집하나요?',
        items: [
          '회원 가입 및 로그인에 필요한 정보',
          '사용자가 직접 작성한 묵상, 만나, 감사 기록',
          '앱 이용 안정성과 개선을 위한 기본적인 기술 정보',
        ],
      },
      {
        heading: '왜 이 정보를 사용하나요?',
        items: ['계정 식별과 로그인 유지', '작성한 기록 저장 및 조회', '서비스 오류 확인 및 기능 개선'],
      },
      {
        heading: '사용자의 기록은 어떻게 다루나요?',
        items: [
          '사용자가 작성한 기록은 사용자가 다시 확인하고 관리할 수 있도록 저장됩니다.',
          '서비스 운영에 필요한 범위를 넘어서 임의로 공개하거나 판매하지 않습니다.',
          '법령상 필요하거나 사용자의 요청이 있는 경우를 제외하고, 기록은 본인의 서비스 이용 목적 안에서만 다뤄집니다.',
        ],
      },
      {
        heading: '사용자는 무엇을 할 수 있나요?',
        items: ['본인 기록을 수정하거나 삭제할 수 있습니다.', '계정 삭제 또는 데이터 관련 문의를 할 수 있습니다.'],
      },
      {
        heading: '문의',
        items: [`개인정보 관련 문의가 있으시면 ${MY_CONTACT_EMAIL}로 연락해 주세요.`],
      },
    ],
    footerNote:
      '※ 실제 서비스 운영 전에는 수집 항목, 보관 기간, 제3자 제공/위탁 여부, 문의 채널 정보를 운영 정책에 맞게 다시 확인해 주세요.',
  },
  terms: {
    title: '이용약관',
    description: '서비스 이용에 필요한 기본 사항을 안내합니다.',
    summary: 'pray-stack을 이용하시는 분은 아래 기본 이용 원칙을 확인해 주세요.',
    sections: [
      {
        heading: '서비스 소개',
        items: ['pray-stack은 말씀, 묵상, 감사 기록을 돕기 위한 개인 기록형 서비스입니다.'],
      },
      {
        heading: '계정과 이용',
        items: [
          '사용자는 본인 계정 정보를 안전하게 관리해야 합니다.',
          '타인의 계정을 무단으로 사용해서는 안 됩니다.',
          '서비스 운영을 방해하거나 비정상적인 방식으로 이용해서는 안 됩니다.',
        ],
      },
      {
        heading: '작성한 콘텐츠',
        items: [
          '사용자가 작성한 기록의 책임은 작성자에게 있습니다.',
          '사용자는 본인이 작성한 내용을 수정하거나 삭제할 수 있습니다.',
          '운영상 필요한 범위에서 서비스 내 저장, 표시, 백업이 이루어질 수 있습니다.',
        ],
      },
      {
        heading: '서비스 변경',
        items: [
          '서비스 기능은 운영 상황에 따라 변경되거나 조정될 수 있습니다.',
          '중요한 변경이 있는 경우 앱 또는 관련 화면을 통해 안내할 수 있습니다.',
        ],
      },
      {
        heading: '책임 제한',
        items: [
          'pray-stack은 안정적인 서비스를 제공하기 위해 노력하지만, 모든 상황에서 서비스가 중단 없이 제공됨을 보장하지는 않습니다.',
          '사용자의 기기 문제, 네트워크 환경, 외부 서비스 장애 등으로 일부 기능 이용이 제한될 수 있습니다.',
        ],
      },
      {
        heading: '문의',
        items: [`서비스 이용 중 불편이나 문의사항이 있으면 ${MY_CONTACT_EMAIL}로 문의해 주세요.`],
      },
    ],
    footerNote: '※ 운영자 정보, 문의 이메일, 시행일, 준거법은 실제 운영 기준으로 배포 전 반드시 반영해 주세요.',
  },
  contact: {
    title: '문의하기',
    description: '제안이나 불편사항을 전달할 수 있습니다.',
    summary: '문의나 제안은 언제든지 환영합니다.',
    paragraphs: [
      '앱 사용 중 불편했던 점, 추가되었으면 하는 기능, 수정이 필요한 내용이 있다면 편하게 알려 주세요.',
      '보내주신 의견은 서비스 개선에 큰 도움이 됩니다.',
    ],
  },
};

// TODO(출시 전 정책 점검):
// - 개인정보 처리방침: 보관 기간, 제3자 제공, 처리 위탁, 문의 채널 실제값 반영
// - 이용약관: 운영자 정보, 시행일, 준거법 명시
