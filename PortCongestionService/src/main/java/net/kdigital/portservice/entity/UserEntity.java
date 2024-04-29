package net.kdigital.portservice.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.kdigital.portservice.dto.UserDTO;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@ToString
@Builder

@Entity
@Table(name="user_info")
public class UserEntity {
	
	@Id
	@Column(name="user_email", nullable=false)
	private String userEmail;
	
	@Column(name="user_pwd", nullable=false)
	private String userPwd;
	
	@Column(name="user_name", nullable=false)
	private String Nickname;
	
	@Column(name="user_phone", nullable=false)
	private String userPhone;
	
	private String company;
	
	@Column(name="join_date")
	private LocalDateTime joinDate;
	
	@Column(name="user_role")
	private String userRole;
	
	@Column(name="notification_setting")
	private boolean notificationSetting;
	
	private boolean enabled;
	
	public static UserEntity toEntity(UserDTO userDTO) {
		return UserEntity.builder()
				.userEmail(userDTO.getUserEmail())
				.userPwd(userDTO.getUserPwd())
				.Nickname(userDTO.getNickname())
				.userPhone(userDTO.getUserPhone())
				.company(userDTO.getCompany())
				.joinDate(userDTO.getJoinDate())
				.userRole(userDTO.getUserRole())
				.notificationSetting(userDTO.isNotificationSetting())
				.enabled(userDTO.isEnabled())
				.build();
	}
	
}
