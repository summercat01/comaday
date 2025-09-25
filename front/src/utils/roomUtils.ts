/**
 * 룸 넘버 매핑 유틸리티
 * 백엔드에서 제공하는 원본 룸 넘버를 사용자에게 표시할 룸 넘버로 변환
 */
export const getMappedRoomNumber = (originalRoomNumber: number): number => {
  const roomMapping: { [key: number]: number } = {
    1: 1,    // 1번방은 그대로 1
    2: 18,   // 2번방 → 18
    3: 19,   // 3번방 → 19
    4: 20,   // 4번방 → 20
    5: 21,   // 5번방 → 21
    6: 14,   // 6번방 → 14
    7: 5,    // 7번방 → 5
    8: 6,    // 8번방 → 6
    9: 7,    // 9번방 → 7
    10: 25,  // 10번방 → 25
    11: 26   // 11번방 → 26
  };
  
  return roomMapping[originalRoomNumber] || originalRoomNumber;
};
