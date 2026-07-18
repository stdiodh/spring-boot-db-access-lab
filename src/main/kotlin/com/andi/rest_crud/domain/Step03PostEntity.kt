/*
 * 실습 순서 03 — 게시글 저장 계약
 * 선행 단계: Step01의 title/content Validation과 Step02의 email 길이를 확인합니다.
 * 이 단계의 판단: 요청 최대 길이와 작성자 식별값을 H2/MySQL 양쪽에서 같은 범위로 저장합니다.
 * 다음 연결: Step08이 인증된 email을 author로 기록하고 수정·삭제 전에 소유권을 비교합니다.
 */
package com.andi.rest_crud.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "posts")
class PostEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    // 실습 빈칸 대응: title 컬럼은 요청 DTO와 같은 최대 길이를 사용합니다.
    // 설명 포인트: Validation을 통과한 제목은 저장 단계에서도 그대로 보존되어야 합니다.
    // 확인 질문: DTO와 컬럼 길이 중 어느 쪽이 더 짧을 때 문제가 생길까요?
    @Column(nullable = false, length = 100)
    var title: String,

    // 실습 빈칸 대응: content 컬럼은 지원 DB 모두에서 본문 저장 범위를 보장합니다.
    // 설명 포인트: 개발용 H2와 수업용 MySQL이 같은 길이 계약을 가져야 합니다.
    // 확인 질문: 한 DB에서만 통과하는 매핑은 테스트 신뢰도에 어떤 영향을 줄까요?
    @Column(nullable = false, length = 5000)
    var content: String,

    // 실습 빈칸 대응: author 컬럼은 사용자 email과 같은 길이의 식별값을 저장합니다.
    // 설명 포인트: 작성자 비교에 쓸 값은 원본 사용자 식별자와 같은 저장 범위를 가져야 합니다.
    // 확인 질문: author가 잘리면 이후 소유권 비교는 어떤 결과를 낼까요?
    @Column(nullable = false, length = 254)
    var author: String
) {
    // 쓰기 transaction 안에서 값을 바꾸면 JPA dirty checking이 반영하므로 Service에서 save를 반복하지 않습니다.
    fun update(title: String, content: String) {
        this.title = title
        this.content = content
    }

    // 실습 빈칸 대응: 저장된 작성자와 현재 principal이 같은지 판단합니다.
    // 설명 포인트: 인증 성공은 신원을 증명할 뿐, 특정 게시글의 소유권까지 보장하지 않습니다.
    // 확인 질문: 로그인한 사용자라면 모든 게시글을 수정해도 될까요?
    fun isWrittenBy(email: String): Boolean = author == email
}
